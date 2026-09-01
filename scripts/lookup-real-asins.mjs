// Looks up real Amazon ASINs for every product across src/pages/*.astro using
// the Creators API, and writes a report for human spot-checking.
// It does NOT modify any .astro files — that's a separate, explicit apply step
// after the report has been reviewed, since blind auto-replacement on ambiguous
// product names (model numbers, bundles, variants) risks linking the wrong item.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const PAGES_DIR = join(ROOT, 'src', 'pages');
const ENV_PATH = join(ROOT, '.env');
const REPORT_PATH = join(ROOT, 'scripts', 'asin-lookup-report.json');

const PARTNER_TAG = 'sktiger-20';
const MARKETPLACE = 'www.amazon.com';
const TOKEN_ENDPOINT = 'https://api.amazon.com/auth/o2/token';
const SEARCH_ENDPOINT = 'https://creatorsapi.amazon/catalog/v1/searchItems';

function loadEnv() {
  if (!existsSync(ENV_PATH)) {
    console.error(`Missing ${ENV_PATH}. Create it with CREATORS_API_CLIENT_ID and CREATORS_API_CLIENT_SECRET.`);
    process.exit(1);
  }
  const lines = readFileSync(ENV_PATH, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  if (!env.CREATORS_API_CLIENT_ID || !env.CREATORS_API_CLIENT_SECRET) {
    console.error('CREATORS_API_CLIENT_ID and/or CREATORS_API_CLIENT_SECRET missing from .env');
    process.exit(1);
  }
  return env;
}

function extractProducts() {
  const files = readdirSync(PAGES_DIR).filter((f) => f.endsWith('.astro'));
  const products = [];

  for (const file of files) {
    const filePath = join(PAGES_DIR, file);
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    let current = null;

    lines.forEach((line, idx) => {
      const idMatch = line.match(/^\s*id:\s*"([^"]*)"/);
      const nameMatch = line.match(/^\s*name:\s*"((?:[^"\\]|\\.)*)"/);
      const urlMatch = line.match(/^\s*amazonUrl:\s*"([^"]*)"/);

      if (idMatch) {
        current = { file, id: idMatch[1], name: null, oldUrl: null, line: idx + 1 };
      } else if (nameMatch && current) {
        current.name = nameMatch[1].replace(/\\"/g, '"');
      } else if (urlMatch && current) {
        current.oldUrl = urlMatch[1];
        products.push(current);
        current = null;
      }
    });
  }
  return products;
}

async function getAccessToken(clientId, clientSecret) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'creatorsapi::default',
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Token request failed: HTTP ${res.status} — ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function searchItem(token, keywords, attempt = 1) {
  const res = await fetch(SEARCH_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-marketplace': MARKETPLACE,
    },
    body: JSON.stringify({
      keywords,
      partnerTag: PARTNER_TAG,
      marketplace: MARKETPLACE,
      resources: ['itemInfo.title', 'images.primary.medium'],
    }),
  });

  if (res.status === 429 && attempt <= 3) {
    await new Promise((r) => setTimeout(r, 1000 * attempt));
    return searchItem(token, keywords, attempt + 1);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: `HTTP ${res.status}: ${JSON.stringify(body)}` };
  }
  return body;
}

function titleSimilarity(a, b) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const wa = new Set(norm(a));
  const wb = new Set(norm(b));
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  return overlap / Math.max(wa.size, 1);
}

async function main() {
  const env = loadEnv();
  console.log('Requesting access token...');
  const token = await getAccessToken(env.CREATORS_API_CLIENT_ID, env.CREATORS_API_CLIENT_SECRET);
  console.log('Token acquired.\n');

  let products = extractProducts();
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  if (limitArg) products = products.slice(0, Number(limitArg.split('=')[1]));
  console.log(`Found ${products.length} products across src/pages. Looking up each...\n`);

  const report = [];

  for (const [i, p] of products.entries()) {
    process.stdout.write(`[${i + 1}/${products.length}] ${p.name} ... `);
    try {
      const result = await searchItem(token, p.name);
      if (result.error) {
        console.log(`ERROR: ${result.error}`);
        report.push({ ...p, status: 'error', error: result.error });
      } else {
        const items = result.items || result.searchResult?.items || [];
        if (!items.length) {
          console.log('NO MATCH');
          report.push({ ...p, status: 'no_match' });
        } else {
          const top = items[0];
          const title = top.itemInfo?.title?.displayValue || top.title || '(no title returned)';
          const asin = top.asin || top.ASIN;
          const sim = titleSimilarity(p.name, title);
          const flag = sim < 0.35 ? 'LOW_CONFIDENCE' : 'ok';
          console.log(`${asin} (${flag}, sim=${sim.toFixed(2)}) — "${title}"`);
          report.push({
            ...p,
            status: 'matched',
            matchedAsin: asin,
            matchedTitle: title,
            similarity: Number(sim.toFixed(2)),
            confidence: flag,
            newUrl: `https://www.amazon.com/dp/${asin}?tag=${PARTNER_TAG}`,
          });
        }
      }
    } catch (err) {
      console.log(`EXCEPTION: ${err.message}`);
      report.push({ ...p, status: 'exception', error: err.message });
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

  const matched = report.filter((r) => r.status === 'matched');
  const lowConf = matched.filter((r) => r.confidence === 'LOW_CONFIDENCE');
  const failed = report.filter((r) => r.status !== 'matched');

  console.log(`\nDone. ${matched.length}/${report.length} matched, ${lowConf.length} low-confidence, ${failed.length} failed/no-match.`);
  console.log(`Full report written to ${REPORT_PATH} — review before applying.`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
