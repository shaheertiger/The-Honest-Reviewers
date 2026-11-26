#!/usr/bin/env node
// Daily Bing Webmaster Tools pull: what is working on Bing, and where to double down.
//
// Reads the API key from the BING_WEBMASTER_API_KEY environment variable, or from `apikey`
// (the name the owner saved the Bing Webmaster key under in this environment). Bing's API takes
// the key as a URL parameter, so it cannot be injected as a header. Never print or commit the key.
//
// Writes:
//   content/analytics/bing-queries-<date>.csv   latest week of query stats
//   content/analytics/bing-summary-<date>.json  what is working, rising, zero-click and gaps
// and prints a short summary for the daily report.
//
// Exit codes: 0 ok, 2 no API key, 3 API error (the daily run reports it and carries on
// with Vercel traffic and the seed list).
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://www.thehonestreviewers.com/';
const KEY = (process.env.BING_WEBMASTER_API_KEY || process.env.apikey || '').trim();
const ROOT = new URL('..', import.meta.url).pathname;
const today = new Date().toISOString().slice(0, 10);

if (!KEY) {
  console.log('[bing] No Bing key found (BING_WEBMASTER_API_KEY or apikey): skipping the Bing pull. Add it in the environment settings (Bing Webmaster Tools > Settings > API access).');
  process.exit(2);
}

async function call(method) {
  const url = `https://ssl.bing.com/webmaster/api.svc/json/${method}?siteUrl=${encodeURIComponent(SITE)}&apikey=${encodeURIComponent(KEY)}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} HTTP ${res.status}: ${text.slice(0, 200)}`);
  const json = JSON.parse(text);
  return json.d ?? json;
}

// Bing returns dates as "/Date(1700000000000)/" (sometimes with a timezone offset).
const toDate = (v) => {
  const m = String(v).match(/\/Date\((\d+)/);
  return m ? new Date(Number(m[1])) : new Date(v);
};

// Which page "owns" a query: a page whose slug or first tag matches the query's words.
function loadPages() {
  const dir = join(ROOT, 'src/pages');
  const pages = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.astro')) continue;
    const src = readFileSync(join(dir, f), 'utf8');
    const m = src.match(/tags:\s*\[\s*"([^"]+)"/);
    pages.push({ slug: f.replace(/\.astro$/, ''), tag: m ? m[1].toLowerCase() : '' });
  }
  return pages;
}
const words = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/)
  .filter((w) => w && !['best', 'the', 'for', 'a', 'of', 'to', 'in', 'and', 'top', 'rated', '2025', '2026', '2027', 'reviews', 'review', 'reviewed', 'most', 'reliable', 'highest', 'good', 'cheap', 'budget', 'buy', 'what', 'is', 'which', 'new', 'home', 'use'].includes(w))
  .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
  .map((w) => ({ purifier: 'filter', purifiers: 'filter', vac: 'vacuum', weedeater: 'trimmer' }[w] || w));
// A query is "covered" when every distinctive word in it appears in a page's slug or first
// tag; one soft word (cost, price, kit...) may differ. Prefer the most specific page.
const SOFT = new Set(['cost', 'price', 'installation', 'installed', 'system', 'unit', 'machine', 'kit', 'brand', 'model', 'deal', 'sale']);
function ownerPage(query, pages) {
  const q = [...new Set(words(query))];
  if (!q.length) return null;
  let best = null;
  for (const p of pages) {
    const pw = new Set([...words(p.slug.replace(/-/g, ' ')), ...words(p.tag)]);
    const missing = q.filter((w) => !pw.has(w));
    if (missing.length > 1 || (missing.length === 1 && !SOFT.has(missing[0]))) continue;
    const extra = pw.size - (q.length - missing.length);
    if (!best || missing.length < best.missing || (missing.length === best.missing && extra < best.extra)) best = { slug: p.slug, missing: missing.length, extra };
  }
  return best ? best.slug : null;
}

try {
  const rows = await call('GetQueryStats');
  if (!Array.isArray(rows) || !rows.length) throw new Error('GetQueryStats returned no rows');

  // Group by reporting period (Bing returns one row per query per period).
  const periods = [...new Set(rows.map((r) => toDate(r.Date).toISOString().slice(0, 10)))].sort();
  const latest = periods.at(-1);
  const prev = periods.at(-2);
  const agg = (period) => {
    const m = new Map();
    for (const r of rows) {
      if (toDate(r.Date).toISOString().slice(0, 10) !== period) continue;
      const k = String(r.Query).toLowerCase();
      const o = m.get(k) || { query: k, impressions: 0, clicks: 0, posSum: 0 };
      o.impressions += Number(r.Impressions || 0);
      o.clicks += Number(r.Clicks || 0);
      o.posSum += Number(r.AvgImpressionPosition || 0) * Number(r.Impressions || 0);
      m.set(k, o);
    }
    for (const o of m.values()) o.position = o.impressions ? +(o.posSum / o.impressions).toFixed(1) : null;
    return m;
  };
  const now = agg(latest);
  const before = prev ? agg(prev) : new Map();
  const pages = loadPages();

  const list = [...now.values()].map((o) => {
    const b = before.get(o.query);
    return {
      query: o.query, impressions: o.impressions, clicks: o.clicks, position: o.position,
      ctr: o.impressions ? +((o.clicks / o.impressions) * 100).toFixed(1) : 0,
      impressionsChange: o.impressions - (b ? b.impressions : 0),
      page: ownerPage(o.query, pages),
    };
  }).sort((a, b) => b.impressions - a.impressions);

  const working = list.filter((q) => q.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 15);
  const rising = list.filter((q) => q.impressionsChange > 0).sort((a, b) => b.impressionsChange - a.impressionsChange).slice(0, 15);
  const zeroClick = list.filter((q) => q.clicks === 0 && q.impressions >= 20 && q.position && q.position <= 10).slice(0, 15);
  const gaps = list.filter((q) => !q.page && q.impressions >= 10 && /\bbest\b|\breview|\bvs\b|top rated/.test(q.query)).slice(0, 15);

  // Niches doing best on Bing: group clicked/rising queries by the page cluster they land on.
  const nicheScore = {};
  for (const q of list) {
    if (!q.page) continue;
    const niche = q.page.replace(/^best-/, '').split('-').slice(0, 2).join('-');
    nicheScore[niche] = (nicheScore[niche] || 0) + q.clicks * 10 + Math.max(0, q.impressionsChange);
  }
  const topNiches = Object.entries(nicheScore).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, s]) => ({ niche: n, score: s }));

  const outDir = join(ROOT, 'content/analytics');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const csv = ['Query,Impressions,Clicks,CTR,Position,ImpressionsChange,Page',
    ...list.map((q) => [JSON.stringify(q.query), q.impressions, q.clicks, q.ctr, q.position ?? '', q.impressionsChange, q.page ?? ''].join(','))].join('\n');
  writeFileSync(join(outDir, `bing-queries-${today}.csv`), csv + '\n');
  // Site-wide daily totals (GetRankAndTrafficStats) are fresher than the weekly query table
  // and count every impression, not only the queries Bing lists one by one.
  let siteTotals = null;
  try {
    const daily = (await call('GetRankAndTrafficStats'))
      .map((d) => ({ date: toDate(d.Date).toISOString().slice(0, 10), impressions: d.Impressions, clicks: d.Clicks }))
      .sort((x, y) => (x.date < y.date ? -1 : 1));
    const last7 = daily.slice(-7), prev7 = daily.slice(-14, -7);
    const sum = (a, k) => a.reduce((t, d) => t + d[k], 0);
    if (last7.length) siteTotals = {
      from: last7[0].date, to: last7.at(-1).date,
      impressions: sum(last7, 'impressions'), clicks: sum(last7, 'clicks'),
      previous: prev7.length ? { from: prev7[0].date, to: prev7.at(-1).date, impressions: sum(prev7, 'impressions'), clicks: sum(prev7, 'clicks') } : null,
      daily: daily.slice(-14),
    };
  } catch (e) { console.log(`[bing] daily totals unavailable: ${String(e.message || e).split('\n')[0]}`); }
  // Top pages by clicks for the latest weekly period (GetPageStats).
  let topPages = [];
  try {
    const pages = await call('GetPageStats');
    const pk = (r) => toDate(r.Date).toISOString().slice(0, 10);
    const lastP = [...new Set(pages.map(pk))].sort().at(-1);
    topPages = pages.filter((r) => pk(r) === lastP).sort((x, y) => y.Clicks - x.Clicks || y.Impressions - x.Impressions)
      .slice(0, 10).map((r) => ({ page: String(r.Query).replace(SITE, '/'), clicks: r.Clicks, impressions: r.Impressions, period: lastP }));
  } catch (e) { console.log(`[bing] page stats unavailable: ${String(e.message || e).split('\n')[0]}`); }
  const summary = { pulledAt: new Date().toISOString(), period: latest, previousPeriod: prev ?? null,
    siteTotals, topPages,
    totals: { impressions: list.reduce((s, q) => s + q.impressions, 0), clicks: list.reduce((s, q) => s + q.clicks, 0) },
    working, rising, zeroClick, gaps, topNiches };
  writeFileSync(join(outDir, `bing-summary-${today}.json`), JSON.stringify(summary, null, 2) + '\n');

  if (siteTotals) {
    const pv = siteTotals.previous;
    const pct = (n, o) => (o ? `${n >= o ? '+' : ''}${Math.round(((n - o) / o) * 100)}%` : 'n/a');
    console.log(`[bing] site totals ${siteTotals.from}..${siteTotals.to}: ${siteTotals.impressions} impressions, ${siteTotals.clicks} clicks` +
      (pv ? ` (previous 7 days ${pv.impressions} / ${pv.clicks}: ${pct(siteTotals.impressions, pv.impressions)} impressions, ${pct(siteTotals.clicks, pv.clicks)} clicks)` : ''));
  }
  if (topPages.length) console.log(`[bing] top pages by clicks (week of ${topPages[0].period}):`, topPages.slice(0, 5).map((p) => `${p.page} (${p.clicks})`).join('; '));
  console.log(`[bing] query table, week of ${latest} vs ${prev ?? 'n/a'} (listed queries only): ${summary.totals.impressions} impressions, ${summary.totals.clicks} clicks`);
  console.log('[bing] working (most clicks):', working.slice(0, 5).map((q) => `${q.query} (${q.clicks})`).join('; '));
  console.log('[bing] rising:', rising.slice(0, 5).map((q) => `${q.query} (+${q.impressionsChange})`).join('; '));
  console.log('[bing] top niches:', topNiches.map((n) => n.niche).join(', '));
  console.log('[bing] gaps (no page):', gaps.slice(0, 5).map((q) => `${q.query} (${q.impressions})`).join('; ') || 'none');
} catch (err) {
  console.log(`[bing] API error: ${String(err.message || err).split('\n')[0]}`);
  process.exit(3);
}
