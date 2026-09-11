#!/usr/bin/env node
// Reads Search Console exports dropped in content/search-console/ and turns them
// into a ranked opportunity list: pages worth improving before anything new gets
// written, titles worth rewriting, and which thin clusters actually have demand.
//
//   node scripts/gsc-report.mjs                 # the report
//   node scripts/gsc-report.mjs --json          # machine-readable
//   node scripts/gsc-report.mjs --save          # also write demand.json for the topic picker
//
// Accepts the CSVs straight out of Search Console's Export button — Queries.csv
// and Pages.csv — with no renaming or cleanup. Newest file of each type wins.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { buildClusters } from './cluster-report.mjs';

const DATA_DIR = join(import.meta.dirname, '..', 'content', 'search-console');
const SITE = 'https://www.thehonestreviewers.com';

// Thresholds. Striking distance is where an existing page is close enough that
// improving it beats writing a new one; the impression floor keeps noise out.
const STRIKING = { minPos: 5, maxPos: 20, minImpressions: 50 };
const LOW_CTR = { maxPos: 10, minImpressions: 100, ctrFloor: 0.02 };
const MISSING = { minImpressions: 100, maxPos: 50 };

// Search exports never contain newlines inside a field, so parse line by line. That
// makes one malformed row (a stray quote, which these exports do produce) cost that
// row's tidiness rather than silently swallowing every row after it.
function parseLine(line) {
  const out = [];
  let field = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') {
      quoted = true;
    } else if (c === ',') {
      out.push(field); field = '';
    } else {
      field += c;
    }
  }
  out.push(field);
  return out.map((f) => f.replace(/^"+|"+$/g, '').trim());
}

function parseCsv(text) {
  return text.split(/\r?\n/).filter((l) => l.trim()).map(parseLine);
}

const num = (v) => Number(String(v).replace(/[%,\s]/g, '')) || 0;
const pct = (v) => (String(v).includes('%') ? num(v) / 100 : num(v));

function loadExports() {
  if (!existsSync(DATA_DIR)) return { queries: [], pages: [], files: [] };
  const files = readdirSync(DATA_DIR).filter((f) => f.toLowerCase().endsWith('.csv'))
    .map((f) => ({ f, mtime: statSync(join(DATA_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  const queries = [], pages = [], used = [];
  for (const { f } of files) {
    const rows = parseCsv(readFileSync(join(DATA_DIR, f), 'utf8').replace(/^﻿/, ''));
    if (!rows.length) continue;
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const body = rows.slice(1);
    const col = (...names) => header.findIndex((h) => names.some((n) => h.includes(n)));
    const iClicks = col('click'), iImp = col('impression'), iCtr = col('ctr'), iPos = col('position');

    const iQuery = col('quer', 'search term', 'keyword');   // 'Top queries' is plural
    const iPage = col('page', 'url', 'address');

    if (iQuery !== -1 && !queries.length) {
      used.push(f);
      for (const r of body) {
        queries.push({ query: r[iQuery].trim(), clicks: num(r[iClicks]), impressions: num(r[iImp]),
                       ctr: pct(r[iCtr]), position: num(r[iPos]) });
      }
    } else if (iPage !== -1 && !pages.length) {
      used.push(f);
      for (const r of body) {
        const url = r[iPage].trim();
        const slug = url.replace(SITE, '').replace(/^\/|\/$/g, '') || 'index';
        pages.push({ url, slug, clicks: num(r[iClicks]), impressions: num(r[iImp]),
                     ctr: pct(r[iCtr]), position: num(r[iPos]) });
      }
    }
  }
  return { queries, pages, files: used };
}

const { queries, pages, files } = loadExports();
if (!queries.length && !pages.length) {
  console.log(`No Search Console exports found in content/search-console/.\n`);
  console.log(`Export from Search Console: Performance > Export > CSV, then unzip and drop`);
  console.log(`Queries.csv and Pages.csv into content/search-console/. See the README there.`);
  process.exit(0);
}

const { ranked } = buildClusters();
const pillarOf = new Map();
for (const c of ranked) {
  pillarOf.set(c.pillar, c.pillar);
  for (const spoke of c.spokes) pillarOf.set(spoke, c.pillar);
}

// 4. Queries pulling impressions with no page obviously built for them.
const allSlugs = [...pillarOf.keys()];
// Loose stem match so "drying" finds "…-to-dry". Deliberately generous: a false
// "covered" only costs a candidate, while a false gap wastes an article.
const stemHit = (word, slugWords) =>
  slugWords.has(word) ||
  [...slugWords].some((sw) => sw.startsWith(word.slice(0, 4)) || word.startsWith(sw.slice(0, 4)));
const covered = (query) => {
  const words = [...new Set(query.toLowerCase().split(/\s+/).filter((w) => w.length > 2))];
  return allSlugs.some((slug) => {
    const sw = new Set(slug.split('-'));
    const hits = words.filter((w) => stemHit(w, sw)).length;
    return hits >= Math.max(2, Math.ceil(words.length * 0.6));
  });
};
// Best page for a query, by how many of the query's words the slug accounts for.
function bestMatchingSlug(query) {
  const words = [...new Set(query.toLowerCase().split(/\s+/).filter((w) => w.length > 2))];
  let best = null, bestScore = 0;
  for (const slug of allSlugs) {
    const sw = new Set(slug.split('-'));
    const score = words.filter((w) => stemHit(w, sw)).length / Math.max(1, words.length);
    if (score > bestScore) { bestScore = score; best = slug; }
  }
  return bestScore >= 0.6 ? best : null;
}

// 1. Existing pages close enough that improving beats publishing something new.
const striking = pages
  .filter((p) => p.position >= STRIKING.minPos && p.position <= STRIKING.maxPos && p.impressions >= STRIKING.minImpressions)
  .sort((a, b) => b.impressions - a.impressions);

// 2. Ranking well but under-clicked — a title and description problem, not a content one.
const lowCtr = pages
  .filter((p) => p.position <= LOW_CTR.maxPos && p.impressions >= LOW_CTR.minImpressions && p.ctr < LOW_CTR.ctrFloor)
  .sort((a, b) => b.impressions - a.impressions);

// 3. Demand per cluster — what the topic picker uses to break ties between thin clusters.
// Page exports give this directly. Keyword-only exports (Bing Webmaster Tools, or a
// Queries-only download) get attributed to the best-matching page instead, which is
// approximate but enough to rank clusters against each other.
const demand = new Map();
if (pages.length) {
  for (const p of pages) {
    const pillar = pillarOf.get(p.slug);
    if (!pillar) continue;
    demand.set(pillar, (demand.get(pillar) || 0) + p.impressions);
  }
} else {
  for (const q of queries) {
    const slug = bestMatchingSlug(q.query);
    const pillar = slug && pillarOf.get(slug);
    if (!pillar) continue;
    demand.set(pillar, (demand.get(pillar) || 0) + q.impressions);
  }
}
const clusterDemand = ranked
  .map((c) => ({ pillar: c.pillar, spokeCount: c.spokeCount, impressions: demand.get(c.pillar) || 0 }))
  .filter((c) => c.impressions > 0)
  .sort((a, b) => a.spokeCount - b.spokeCount || b.impressions - a.impressions);


// Query-level versions of the page opportunities, for keyword-only exports.
const qStriking = queries
  .filter((q) => q.position >= 4 && q.position <= 20 && q.impressions >= STRIKING.minImpressions)
  .sort((a, b) => b.impressions - a.impressions);

const qLowCtr = queries
  .filter((q) => q.position <= 10 && q.impressions >= LOW_CTR.minImpressions && q.ctr < LOW_CTR.ctrFloor)
  .sort((a, b) => b.impressions - a.impressions);

const gaps = queries
  .filter((q) => q.impressions >= MISSING.minImpressions && q.position <= MISSING.maxPos && !covered(q.query))
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 25);

const report = {
  files,
  striking: striking.slice(0, 20),
  lowCtr: lowCtr.slice(0, 15),
  queryStriking: qStriking.slice(0, 20),
  queryLowCtr: qLowCtr.slice(0, 20),
  clusterDemand: clusterDemand.slice(0, 20),
  gaps,
};

if (process.argv.includes('--save')) {
  writeFileSync(join(DATA_DIR, 'demand.json'),
    JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), clusterDemand }, null, 2) + '\n');
  console.log('Wrote content/search-console/demand.json (the topic picker reads this).\n');
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Read: ${files.join(', ')}  (${queries.length} queries, ${pages.length} pages)\n`);

  if (report.striking.length) {
    console.log(`IMPROVE FIRST — pages at position ${STRIKING.minPos}-${STRIKING.maxPos} with real impressions.`);
    console.log(`Beating these up a few places is worth more than a new article.\n`);
    for (const p of report.striking.slice(0, 12)) {
      console.log(`  pos ${p.position.toFixed(1).padStart(4)}  ${String(p.impressions).padStart(6)} imp  ${(p.ctr * 100).toFixed(1).padStart(4)}%  /${p.slug}/`);
    }
  }

  if (report.lowCtr.length) {
    console.log(`\nREWRITE TITLE/META — pages ranking on page one, not being clicked.\n`);
    for (const p of report.lowCtr.slice(0, 8)) {
      console.log(`  pos ${p.position.toFixed(1).padStart(4)}  ${String(p.impressions).padStart(6)} imp  ${(p.ctr * 100).toFixed(1).padStart(4)}%  /${p.slug}/`);
    }
  }

  if (!pages.length && report.queryStriking.length) {
    console.log(`IMPROVE FIRST — keywords at position 4-20 with real impressions.\n`);
    for (const q of report.queryStriking.slice(0, 12)) {
      const slug = bestMatchingSlug(q.query);
      console.log(`  pos ${q.position.toFixed(1).padStart(4)}  ${String(q.impressions).padStart(7)} imp  ${(q.ctr * 100).toFixed(1).padStart(5)}%  ${q.query}${slug ? `  ->  /${slug}/` : '  ->  (no page matched)'}`);
    }
  }

  if (!pages.length && report.queryLowCtr.length) {
    const imp = report.queryLowCtr.reduce((n, q) => n + q.impressions, 0);
    const clk = report.queryLowCtr.reduce((n, q) => n + q.clicks, 0);
    console.log(`\nRANKING BUT NOT CLICKED — page-one keywords under ${LOW_CTR.ctrFloor * 100}% CTR.`);
    console.log(`${report.queryLowCtr.length} keywords holding ${imp.toLocaleString()} impressions and ${clk} clicks.\n`);
    for (const q of report.queryLowCtr.slice(0, 12)) {
      const slug = bestMatchingSlug(q.query);
      console.log(`  pos ${q.position.toFixed(1).padStart(4)}  ${String(q.impressions).padStart(7)} imp  ${(q.ctr * 100).toFixed(1).padStart(5)}%  ${q.query}${slug ? `  ->  /${slug}/` : ''}`);
    }
  }

  if (report.clusterDemand.length) {
    console.log(`\nTHIN CLUSTERS WITH PROVEN DEMAND — where the daily job should go next.\n`);
    for (const c of report.clusterDemand.slice(0, 10)) {
      console.log(`  ${String(c.spokeCount).padStart(2)} spokes  ${String(c.impressions).padStart(6)} imp  /${c.pillar}/`);
    }
  }

  if (report.gaps.length) {
    console.log(`\nQUERIES WITH NO PAGE BUILT FOR THEM — new article candidates.\n`);
    for (const q of report.gaps.slice(0, 12)) {
      console.log(`  ${String(q.impressions).padStart(6)} imp  pos ${q.position.toFixed(1).padStart(4)}  ${q.query}`);
    }
  }
}
