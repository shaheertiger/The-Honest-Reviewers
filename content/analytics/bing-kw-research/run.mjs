#!/usr/bin/env node
// Slow Bing keyword research for pages Bing does not show yet (owner, Nov 28 2026).
//
//   node content/analytics/bing-kw-research/run.mjs
//
// Key: env `bingapikey2` (never print or commit it). One GetKeywordStats call every 2 s.
// For each page in pages.txt: Bing impressions (last 4 weeks, US) for 3 terms: its main
// keyword (tags[0]), "best <product>" and "<product>". Writes results-NN.json every 50 pages
// and stops cleanly (exit 3) after 5 throttled calls in a row, so it never hammers the API.
// Re-running skips pages already in a results file.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const DIR = import.meta.dirname;
const ROOT = join(DIR, '..', '..', '..');
const KEY = (process.env.bingapikey2 || '').trim();
if (!KEY) { console.log('No bingapikey2 in the environment.'); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pages = readFileSync(join(DIR, 'pages.txt'), 'utf8').trim().split('\n');
const done = {};
for (const f of readdirSync(DIR).filter((f) => /^results-\d+\.json$/.test(f))) Object.assign(done, JSON.parse(readFileSync(join(DIR, f), 'utf8')));
const todo = pages.filter((p) => !(p in done));
let fileNo = readdirSync(DIR).filter((f) => /^results-\d+\.json$/.test(f)).length + 1;
let batch = {}; let throttledInARow = 0;
const save = () => {
  if (!Object.keys(batch).length) return;
  const name = `results-${String(fileNo++).padStart(2, '0')}.json`;
  writeFileSync(join(DIR, name), JSON.stringify(batch, null, 1) + '\n');
  console.log(`saved ${name} (${Object.keys(batch).length} pages)`); batch = {};
};
async function vol(q) {
  const url = `https://ssl.bing.com/webmaster/api.svc/json/GetKeywordStats?q=${encodeURIComponent(q)}&country=us&language=en-US&apikey=${encodeURIComponent(KEY)}`;
  for (let t = 0; t < 2; t++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text = await r.text();
      if (r.ok) { throttledInARow = 0; return (JSON.parse(text).d || []).slice(-4).reduce((a, x) => a + (x.Impressions || 0), 0); }
      if (/Throttle/i.test(text)) { throttledInARow++; if (throttledInARow >= 5) { save(); console.log('STOPPED: Bing is throttling this key. Re-run later; finished pages are kept.'); process.exit(3); } await sleep(30000); continue; }
    } catch { /* timeout or network: retry once */ }
    await sleep(3000);
  }
  return null;
}
for (const s of todo) {
  const src = readFileSync(join(ROOT, 'src', 'pages', `${s}.astro`), 'utf8');
  const tag0 = (((src.match(/tags:\s*\[([^\]]*)\]/) || [])[1] || '').match(/"([^"]+)"/) || [])[1];
  const head = s.replace(/^best-/, '').replace(/-reviews?$/, '').replace(/-/g, ' ');
  const terms = [...new Set([tag0 && tag0.toLowerCase(), `best ${head}`, head].filter(Boolean))];
  const res = [];
  for (const q of terms) { res.push([q, await vol(q)]); await sleep(2000); }
  res.sort((a, b) => (b[1] ?? -1) - (a[1] ?? -1));
  batch[s] = res;
  if (Object.keys(batch).length >= 50) save();
}
save();
console.log('DONE: all pages researched.');
