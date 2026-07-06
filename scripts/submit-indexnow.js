#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const HOST = 'www.thehonestreviewers.com';
const SITE = `https://${HOST}`;
const KEY = process.env.INDEXNOW_KEY || '5b1fe331d1c7c76f34d0aec1619a649e';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const DIST = join(process.cwd(), 'dist');

async function extractUrlsFromSitemaps() {
  if (!existsSync(DIST)) return [];
  const files = (await readdir(DIST)).filter((f) => f.startsWith('sitemap-') && f.endsWith('.xml'));
  const urls = new Set();
  for (const file of files) {
    const xml = await readFile(join(DIST, file), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = m[1].trim();
      if (url.startsWith(SITE) && !url.endsWith('.xml')) urls.add(url);
    }
  }
  return [...urls];
}

async function submit(urlList) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  });
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  return { status: res.status, text: await res.text().catch(() => '') };
}

const urls = await extractUrlsFromSitemaps();
if (urls.length === 0) {
  console.error('[indexnow] No URLs found. Run `astro build` first.');
  process.exit(1);
}

console.log(`[indexnow] Submitting ${urls.length} URLs to ${ENDPOINT}`);
const { status, text } = await submit(urls);
console.log(`[indexnow] Response ${status}${text ? `: ${text}` : ''}`);
if (status >= 400) process.exit(1);
