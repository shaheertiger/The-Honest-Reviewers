import { ApiClient, TypedDefaultApi, SearchItemsRequestContent, GetItemsRequestContent } from "amazon-creators-api";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Credentials pasted from a "<your-id-here>" template keep the angle brackets, and
// Amazon then rejects them with a 401. Strip brackets and stray whitespace up front.
for (const name of Object.keys(process.env).filter((k) => k.startsWith("AMAZON_CREATORS_"))) {
  process.env[name] = process.env[name].trim().replace(/^<(.*)>$/, "$1").trim();
}

const requiredEnvVars = ["AMAZON_CREATORS_CLIENT_ID", "AMAZON_CREATORS_CLIENT_SECRET", "AMAZON_CREATORS_PARTNER_TAG"];
for (const name of requiredEnvVars) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || "3.1";
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || "www.amazon.com";
const api = new TypedDefaultApi(client);

const PRODUCTS_PATH = join(import.meta.dirname, "all-products.json");
const OUTPUT_PATH = join(import.meta.dirname, "..", "src", "data", "product-images.json");
const ASIN_PATH = join(import.meta.dirname, "..", "src", "data", "product-asins.json");
const REPORT_PATH = join(import.meta.dirname, "all-products-match-report.json");

const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf-8"));
const existingImages = existsSync(OUTPUT_PATH) ? JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) : {};
// ASINs are what turn a tagged search link into a direct /dp/ product link.
const asins = existsSync(ASIN_PATH) ? JSON.parse(readFileSync(ASIN_PATH, "utf-8")) : {};

const STOPWORDS = new Set(["the", "best", "premium", "pro", "advanced", "original", "for", "and", "with", "in", "of", "a"]);

function brandTokens(name) {
  // Take leading words until we hit a stopword or a number, cap at 2 tokens.
  const words = name.split(/\s+/);
  const tokens = [];
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z0-9&-]/g, "");
    if (!clean) continue;
    if (STOPWORDS.has(clean.toLowerCase())) break;
    if (/^\d+$/.test(clean)) break;
    tokens.push(clean.toLowerCase());
    if (tokens.length === 2) break;
  }
  return tokens.length ? tokens : [words[0]?.toLowerCase()].filter(Boolean);
}

function isConfidentMatch(queryName, resultTitle) {
  if (!resultTitle) return false;
  const title = resultTitle.toLowerCase();
  const tokens = brandTokens(queryName);
  // Require at least one brand token (min length 3) to appear in the result title.
  return tokens.some((t) => t.length >= 3 && title.includes(t));
}

// The Creators API allows about one request per second; going faster gets ThrottleException.
const DELAY_MS = 1100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(call, attempts = 4) {
  for (let n = 1; ; n++) {
    try {
      return await call();
    } catch (err) {
      const throttled = err?.type === "ThrottleException" || err?.body?.type === "ThrottleException";
      if (!throttled || n >= attempts) throw err;
      await sleep(DELAY_MS * 2 ** n);
    }
  }
}

const searchWithRetry = (req) => withRetry(() => api.searchItems(client.marketplace, req));
const getItemsWithRetry = (req) => withRetry(() => api.getItems(client.marketplace, req));

const errorDetail = (err) =>
  // API errors arrive as plain objects, so String(err) would only say "[object Object]".
  typeof err?.message === "string" ? err.message : JSON.stringify(err?.body ?? err?.message ?? err);

const images = { ...existingImages };
const report = [];

// A product that already has an ASIN (often hand-verified) but no image gets its
// picture by ASIN lookup. A name search here would return whatever Amazon ranks
// first and overwrite a correct ASIN with a different product or pack size.
const byAsin = products.filter(({ id }) => asins[id] && !images[id]);
const GET_ITEMS_BATCH = 10; // GetItems accepts at most 10 ASINs per request
for (let i = 0; i < byAsin.length; i += GET_ITEMS_BATCH) {
  const batch = byAsin.slice(i, i + GET_ITEMS_BATCH);
  try {
    const req = new GetItemsRequestContent();
    req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG;
    req.itemIds = [...new Set(batch.map(({ id }) => asins[id]))];
    req.resources = ["itemInfo.title", "images.primary.medium"];
    const result = await getItemsWithRetry(req);
    const found = new Map((result?.itemsResult?.items || []).map((it) => [it.asin, it]));
    for (const { id, name, file } of batch) {
      const item = found.get(asins[id]);
      const url = item?.images?.primary?.medium?.url;
      if (url) {
        images[id] = url;
        report.push({ id, name, file, status: "image-by-asin", matchedTitle: item.itemInfo?.title?.displayValue, asin: asins[id] });
      } else {
        report.push({ id, name, file, status: "asin-not-found", asin: asins[id] });
      }
    }
  } catch (err) {
    for (const { id, name, file } of batch) report.push({ id, name, file, status: "error", error: errorDetail(err) });
  }
  console.log(`ASIN lookups ${Math.min(i + GET_ITEMS_BATCH, byAsin.length)}/${byAsin.length}...`);
  await sleep(DELAY_MS);
}
const lookedUp = new Set(byAsin.map(({ id }) => id));

for (let i = 0; i < products.length; i++) {
  const { id, name, file } = products[i];
  if (lookedUp.has(id)) continue; // handled by the ASIN lookup above
  // Skip only when BOTH the image and the ASIN are known. Checking the image alone
  // stranded every product matched before ASIN capture existed: it has a picture, so
  // it was skipped, so it never got the /dp/ link that pays better than a search link.
  if (images[id] && asins[id]) {
    report.push({ id, name, file, status: "already-cached" });
    continue;
  }
  try {
    const req = new SearchItemsRequestContent();
    req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG;
    req.keywords = name;
    req.itemCount = 3;
    req.searchIndex = "All";
    req.resources = ["itemInfo.title", "images.primary.medium"];
    const result = await searchWithRetry(req);
    const items = result?.searchResult?.items || [];
    const match = items.find((it) => isConfidentMatch(name, it?.itemInfo?.title?.displayValue));

    if (match) {
      // Never replace a known ASIN with a search hit; only fill a missing one.
      if (asins[id] && match.asin && match.asin !== asins[id]) {
        report.push({ id, name, file, status: "rejected", reason: "search hit differs from known ASIN", topResultTitle: match.itemInfo.title.displayValue });
        if (i % 10 === 0) console.log(`${i + 1}/${products.length}...`);
        await sleep(DELAY_MS);
        continue;
      }
      images[id] = match.images.primary.medium.url;
      if (match.asin) asins[id] = match.asin;
      report.push({ id, name, file, status: "accepted", matchedTitle: match.itemInfo.title.displayValue, asin: match.asin });
    } else {
      report.push({ id, name, file, status: "rejected", topResultTitle: items[0]?.itemInfo?.title?.displayValue || null });
    }
  } catch (err) {
    report.push({ id, name, file, status: "error", error: errorDetail(err) });
  }

  if (i % 10 === 0) console.log(`${i + 1}/${products.length}...`);
  await sleep(DELAY_MS);
}

writeFileSync(OUTPUT_PATH, JSON.stringify(images, null, 2) + "\n");
writeFileSync(ASIN_PATH, JSON.stringify(asins, null, 2) + "\n");
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

const accepted = report.filter((r) => r.status === "accepted").length;
const rejected = report.filter((r) => r.status === "rejected").length;
const errors = report.filter((r) => r.status === "error").length;
const byAsinOk = report.filter((r) => r.status === "image-by-asin").length;
const byAsinMissing = report.filter((r) => r.status === "asin-not-found").length;
console.log(`Done. accepted=${accepted} rejected=${rejected} errors=${errors} image_by_asin=${byAsinOk} asin_not_found=${byAsinMissing} total_images=${Object.keys(images).length} total_asins=${Object.keys(asins).length}`);
