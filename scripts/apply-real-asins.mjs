// Applies the ASIN lookup report (scripts/asin-lookup-report.json) to the
// .astro pages. Only "matched" entries with confidence "ok" are applied
// automatically. "LOW_CONFIDENCE", "no_match", "error", and "exception"
// entries are left untouched (still on their amazon.com/s?k= search-link
// fallback) and listed at the end for manual review.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const REPORT_PATH = join(ROOT, 'scripts', 'asin-lookup-report.json');

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
    if (entry.status === 'matched' && entry.confidence === 'ok') {
      const oldLine = `amazonUrl: "${entry.oldUrl}"`;
      const newLine = `amazonUrl: "${entry.newUrl}"`;
      if (content.includes(oldLine)) {
        content = content.replace(oldLine, newLine);
        changed = true;
        appliedCount++;
      } else {
        skipped.push({ ...entry, reason: 'old_url_not_found_verbatim' });
      }
    } else {
      skipped.push({ ...entry, reason: entry.status === 'matched' ? 'low_confidence' : entry.status });
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
