#!/usr/bin/env node
// One-time codemod: brings every article page onto the format used by
// best-self-propelled-lawn-mower.astro. Idempotent — re-running is a no-op.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { articlePages, auditPage } from '../format-audit.mjs';
import { PAGES_DIR, read, extractFaqs, pageMeta } from './lib.mjs';
import { normalizeSchema } from './schema.mjs';
import { anchorFaq, anchorSections, authorBlock, tocBlock, insertAboveBody, ensureImport } from './blocks.mjs';

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
const targets = only.length ? only : articlePages();

let changed = 0;
const failures = [];

for (const slug of targets) {
  const missing = auditPage(slug);
  if (!missing.length) continue;

  try {
    const original = read(slug);
    let source = original;
    const meta = pageMeta(slug, source);

    if (missing.includes('faqSection')) source = anchorFaq(source);

    if (missing.includes('toc')) {
      const anchored = anchorSections(source);
      source = anchored.source;
      var tocEntries = anchored.entries;
    }

    const above = [];
    if (missing.includes('authorBox')) {
      source = ensureImport(source, 'SocialProof');
      above.push(authorBlock(meta));
    }
    if (missing.includes('toc') && tocEntries.length >= 3) above.push(tocBlock(tocEntries));
    source = insertAboveBody(source, above);

    source = normalizeSchema(source, meta, extractFaqs(source));

    if (source !== original) {
      changed++;
      if (!dryRun) writeFileSync(join(PAGES_DIR, `${slug}.astro`), source);
    }
  } catch (error) {
    failures.push(`${slug}: ${error.message}`);
  }
}

console.log(`${changed} page(s) rewritten${dryRun ? ' (dry run)' : ''}`);
if (failures.length) {
  console.log(`\n${failures.length} page(s) need hand editing:`);
  for (const f of failures) console.log(`  ${f}`);
}
