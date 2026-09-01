// Applies the ASIN lookup report (scripts/asin-lookup-report.json) to the
// .astro pages. A direct product link is only applied automatically when:
//   - status is "matched"
//   - title similarity is >= MIN_SIMILARITY (raised from the lookup script's
//     0.35 "ok" bar — spot-checking showed 0.35-0.59 matches include real
//     wrong-product mismatches, e.g. a mower model matched to a tune-up kit
//     accessory for it, or a specific sealer matched to a different product
//     from the same brand)
//   - the product name doesn't look like a rental/service company (these
//     aren't purchasable Amazon products at all — e.g. "Sunbelt Rentals"
//     scored a perfect 1.00 similarity match to an unrelated NASCAR trading
//     card, purely because both share the word "Rentals")
// Everything else is left on its existing amazon.com/s?k= search-link
// fallback (already real, already tagged) and listed for manual review.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const REPORT_PATH = join(ROOT, 'scripts', 'asin-lookup-report.json');
const MIN_SIMILARITY = 0.6;
const SERVICE_NAME_PATTERN = /\brental(s)?\b/i;

if (!existsSync(REPORT_PATH)) {
  console.error(`No report found at ${REPORT_PATH}. Run lookup-real-asins.mjs first.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));
const byFile = new Map();

for (const entry of report) {
  if (!byFile.has(entry.file)) byFile.set(entry.file, []);
  byFile.get(entry.file).push(entry);
}

let appliedCount = 0;
const skipped = [];

for (const [file, entries] of byFile) {
  const filePath = join(ROOT, 'src', 'pages', file);
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;

  for (const entry of entries) {
    const isServiceName = SERVICE_NAME_PATTERN.test(entry.name);
    const highConfidence = entry.status === 'matched' && entry.similarity >= MIN_SIMILARITY;

    if (highConfidence && !isServiceName) {
      const oldLine = `amazonUrl: "${entry.oldUrl}"`;
      const newLine = `amazonUrl: "${entry.newUrl}"`;
      if (content.includes(oldLine)) {
        content = content.replace(oldLine, newLine);
        changed = true;
        appliedCount++;
      } else {
        skipped.push({ ...entry, reason: 'old_url_not_found_verbatim' });
      }
    } else if (isServiceName) {
      skipped.push({ ...entry, reason: 'service_not_a_product' });
    } else {
      skipped.push({ ...entry, reason: entry.status === 'matched' ? `below_similarity_threshold(${entry.similarity})` : entry.status });
    }
  }

  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`${file}: updated`);
  }
}

console.log(`\nApplied ${appliedCount} direct product links.`);
if (skipped.length) {
  console.log(`\n${skipped.length} entries left on search-link fallback (need manual review):`);
  for (const s of skipped) {
    console.log(`  - [${s.file}] ${s.name} — ${s.reason}${s.matchedTitle ? ` (matched: "${s.matchedTitle}")` : ''}`);
  }
}
