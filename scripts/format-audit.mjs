#!/usr/bin/env node
// Audits every article page against the canonical format used by
// best-self-propelled-lawn-mower.astro and reports what each page is missing.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');
// Pages that are not articles and deliberately use a different layout.
const NON_ARTICLE = new Set(['index', 'best-of', 'sand-calculator', '404']);

export const CHECKS = [
  ['hero', (s) => /bg-gray-900 py-16/.test(s)],
  ['trustBadge', (s) => /TrustBadge/.test(s)],
  ['authorBox', (s) => /Author &amp; Meta|Author & Meta/.test(s) && /pravatar/.test(s)],
  ['socialProof', (s) => /SocialProof/.test(s)],
  ['toc', (s) => /In This Guide/.test(s)],
  ['breadcrumbSchema', (s) => /BreadcrumbList/.test(s)],
  ['faqSchema', (s) => /FAQPage/.test(s)],
  ['articleSchema', (s) => /"@type":\s*"Article"/.test(s)],
  ['jsonLd', (s) => /jsonLd=/.test(s)],
  ['faqSection', (s) => /id="faq"/.test(s)],
  ['commonMistakes', (s) => /Common Mistakes/i.test(s)],
  ['relatedGuides', (s) => /Related [\w &]*Guides/i.test(s)],
  ['closing', (s) => /The Bottom Line/i.test(s)],
];

export function articlePages() {
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.astro'))
    .map((f) => f.replace(/\.astro$/, ''))
    .filter((slug) => !NON_ARTICLE.has(slug))
    .sort();
}

export function auditPage(slug) {
  const source = readFileSync(join(PAGES_DIR, `${slug}.astro`), 'utf-8');
  return CHECKS.filter(([, test]) => !test(source)).map(([name]) => name);
}

if (import.meta.filename === process.argv[1]) {
  const rows = articlePages()
    .map((slug) => ({ slug, missing: auditPage(slug) }))
    .filter((r) => r.missing.length);

  for (const { slug, missing } of rows) {
    console.log(`${slug.padEnd(48)} ${missing.join(' ')}`);
  }

  const tally = {};
  for (const { missing } of rows) for (const m of missing) tally[m] = (tally[m] || 0) + 1;
  console.log(`\n${rows.length} of ${articlePages().length} article pages are off-format`);
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(3)}  ${k}`);
  }
  if (rows.length) process.exitCode = 1;
}
