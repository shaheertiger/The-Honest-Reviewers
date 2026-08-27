#!/usr/bin/env node
// Applies the authored closing sections in scripts/codemod/content to their pages.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { applyTail } from './tail.mjs';

const dir = join(import.meta.dirname, 'content');
const content = {};
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()) {
  const batch = (await import(join(dir, file))).default;
  for (const [slug, value] of Object.entries(batch)) {
    const existing = (content[slug] ??= {});
    for (const [section, body] of Object.entries(value)) {
      if (existing[section]) throw new Error(`${slug}.${section} is authored in more than one batch`);
      existing[section] = body;
    }
  }
}

const only = new Set(process.argv.slice(2));
let applied = 0;
for (const [slug, value] of Object.entries(content)) {
  if (only.size && !only.has(slug)) continue;
  applyTail(slug, value);
  applied++;
}
console.log(`${applied} page(s) updated from ${Object.keys(content).length} authored entries`);
