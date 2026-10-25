#!/usr/bin/env node
/**
 * Writes a Markdown copy of every built page, plus /llms.txt, so AI assistants
 * and answer engines can read the site without parsing HTML.
 *
 * It runs after the build and reads the rendered HTML, so the Markdown always
 * matches what the page shows. For each page:
 *   /some-page/  ->  /some-page.md      (the home page becomes /index.md)
 *
 * Pages are skipped when they are noindex, when their canonical URL points
 * somewhere else, or when they are error pages. Only the page's <main> content
 * is kept; ads, navigation, scripts and buttons are removed.
 *
 * Usage: node scripts/build-markdown.mjs [--html <dir>] [--out <dir>] [--site <origin>]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const HTML_DIR = arg('html', 'dist');
const OUT_DIR = arg('out', HTML_DIR);
// Used for pages that have no <link rel="canonical">.
const SITE = arg('site', 'https://placeholder.invalid');

// Elements that carry no reading content.
const STRIP = [
  'script', 'style', 'noscript', 'template', 'svg', 'canvas', 'iframe', 'video', 'audio',
  'form', 'button', 'input', 'select', 'textarea', 'dialog', 'nav', 'ins',
  '[aria-hidden="true"]', '[hidden]', '.adsbygoogle', '[data-md-skip]',
].join(',');

const SKIP_FILES = /(^|\/)(404|500|_not-found|_global-error|_error)(\/index)?\.html$|\[/; // error pages, dynamic-route shells

// ---------------------------------------------------------------- helpers

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const yaml = (s) => JSON.stringify(String(s)); // a JSON string is a valid YAML scalar

/** /foo/ or /foo -> /foo.md ; / -> /index.md */
export function markdownPath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '/index.md' : `${p}.md`;
}

function meta(doc, selector) {
  return clean(doc.querySelector(selector)?.getAttribute('content'));
}

/** dateModified / datePublished from JSON-LD, searching nested graphs. */
function jsonLdDates(doc) {
  const dates = {};
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    for (const key of ['dateModified', 'datePublished']) {
      if (!dates[key] && typeof node[key] === 'string') dates[key] = node[key];
    }
    Object.values(node).forEach(visit);
  };
  for (const s of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try { visit(JSON.parse(s.textContent)); } catch { /* ignore malformed blocks */ }
  }
  return dates;
}

const day = (d) => (d ? String(d).slice(0, 10) : '');

// ---------------------------------------------------------------- converter

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  linkStyle: 'inlined',
});
turndown.use(gfm);

// Keep in-page "#anchor" links as plain text: they point nowhere in a .md file.
turndown.addRule('anchorLinks', {
  filter: (node) => node.nodeName === 'A' && (node.getAttribute('href') || '').startsWith('#'),
  replacement: (content) => content,
});

// Collapse table cells to one line so GFM tables stay valid.
turndown.addRule('tableCellNewlines', {
  filter: ['th', 'td'],
  replacement: (content, node) => {
    const text = content.replace(/\n+/g, ' ').replace(/\|/g, '\\|').trim();
    const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
    return (index === 0 ? '| ' : ' ') + text + ' |';
  },
});

const isBlank = (el) => !clean(el.textContent) && !el.querySelector('img');
const hasOwnText = (el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && clean(n.nodeValue));

/** Remove layout leftovers that read badly as text. */
function tidy(root) {
  const doc = root.ownerDocument;
  // Line breaks inside headings would split a Markdown heading in two.
  for (const br of Array.from(root.querySelectorAll('h1 br, h2 br, h3 br, h4 br, h5 br, h6 br'))) {
    br.parentNode.replaceChild(doc.createTextNode(' '), br);
  }
  // Links with nothing to click.
  for (const a of Array.from(root.querySelectorAll('a'))) {
    if (isBlank(a)) a.remove();
  }
  // Card links that wrap whole blocks: keep the card's content and link its heading
  // (or, without a heading, turn the card into one link line).
  for (const a of Array.from(root.querySelectorAll('a[href]'))) {
    if (!a.querySelector('h1, h2, h3, h4, h5, h6, p, div, ul, ol, table')) continue;
    const heading = a.querySelector('h1, h2, h3, h4, h5, h6');
    const link = doc.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    if (heading) {
      link.textContent = clean(heading.textContent);
      heading.textContent = '';
      heading.appendChild(link);
      while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a);
      a.remove();
    } else {
      link.textContent = clean(a.textContent);
      const p = doc.createElement('p');
      p.appendChild(link);
      a.parentNode.replaceChild(p, a);
    }
  }
  // Jump buttons ("#section" links laid out as blocks, not inside a sentence).
  for (const a of Array.from(root.querySelectorAll('a[href^="#"]'))) {
    const parent = a.parentNode;
    if (parent && parent.nodeName === 'DIV' && !hasOwnText(parent)) a.remove();
  }
  // Badges and labels set side by side ("Model Review", "Updated 2026"): separate them.
  for (const el of Array.from(root.querySelectorAll('div > span, div > a'))) {
    const next = el.nextSibling;
    if (next && next.nodeType === 1 && /^(SPAN|A)$/.test(next.nodeName) && !hasOwnText(el.parentNode)) {
      el.parentNode.insertBefore(el.ownerDocument.createTextNode(' · '), next);
    }
  }
  // Containers left empty by stripping, then headings that no longer head anything
  // (e.g. an "In This Guide" title whose table of contents was removed).
  for (const el of Array.from(root.querySelectorAll('div, section, aside, ul, ol, p')).reverse()) {
    if (isBlank(el)) el.remove();
  }
  for (const h of Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
    const parent = h.parentNode;
    if (h.nodeName !== 'H1' && parent && parent !== root && clean(parent.textContent) === clean(h.textContent)) h.remove();
  }
}

function toAbsolute(root, base) {
  for (const el of Array.from(root.querySelectorAll('a[href]'))) {
    const href = el.getAttribute('href');
    if (!href.startsWith('#') && !/^(mailto|tel|javascript):/i.test(href)) {
      try { el.setAttribute('href', new URL(href, base).toString()); } catch { /* leave as is */ }
    }
  }
  for (const el of Array.from(root.querySelectorAll('img'))) {
    const src = el.getAttribute('src') || el.getAttribute('data-src');
    const w = Number(el.getAttribute('width'));
    // Drop avatars, icons and images without a description.
    if (!src || !clean(el.getAttribute('alt')) || (w && w <= 96) || src.startsWith('data:')) {
      el.remove();
      continue;
    }
    try { el.setAttribute('src', new URL(src, base).toString()); } catch { /* leave as is */ }
  }
}

/** Convert one HTML document. Returns null when the page should not get a copy. */
export function convert(html, fileUrl) {
  const doc = domino.createDocument(html);

  const robots = meta(doc, 'meta[name="robots"]').toLowerCase();
  if (robots.includes('noindex')) return null;

  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const url = new URL(canonical || fileUrl);
  const own = new URL(fileUrl);
  // A page that names another URL as canonical is a duplicate: skip it.
  if (url.pathname.replace(/\/+$/, '') !== own.pathname.replace(/\/+$/, '')) return null;

  const main = doc.querySelector('main') || doc.querySelector('article') || doc.body;
  if (!main) return null;
  for (const el of Array.from(main.querySelectorAll(STRIP))) el.remove();
  tidy(main);
  toAbsolute(main, url);

  const title = meta(doc, 'meta[property="og:title"]') || clean(doc.querySelector('title')?.textContent);
  const description = meta(doc, 'meta[name="description"]') || meta(doc, 'meta[property="og:description"]');
  const dates = jsonLdDates(doc);
  const modified = day(meta(doc, 'meta[property="article:modified_time"]') || dates.dateModified);
  const published = day(meta(doc, 'meta[property="article:published_time"]') || dates.datePublished);
  const siteName = meta(doc, 'meta[property="og:site_name"]');
  // "Page title | Site Name" -> "Page title"
  const pageTitle = siteName ? title.replace(new RegExp(`\\s+[|\u2013\u2014-]\\s+${siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '') : title;

  let body = turndown.turndown(main.innerHTML)
    .replace(/^(#+ \d+)\\\./gm, '$1.') // "## 1\. Title" -> "## 1. Title"
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
  if (!/^# /m.test(body) && title) body = `# ${title}\n\n${body}`;
  if (body.length < 50) return null;

  const front = [
    '---',
    `title: ${yaml(pageTitle)}`,
    description && `description: ${yaml(description)}`,
    `url: ${yaml(url.toString())}`,
    published && `date_published: ${published}`,
    modified && `date_modified: ${modified}`,
    siteName && `site: ${yaml(siteName)}`,
    '---',
  ].filter(Boolean).join('\n');

  const md = `${front}\n\n${body}\n\n---\n\nSource: ${url}\n`;
  return { url, title: pageTitle, description, siteName, md, mdPath: markdownPath(url.pathname) };
}

// ---------------------------------------------------------------- llms.txt

function section(pathname, sectionHubs) {
  const slug = pathname.replace(/^\/|\/$/g, '');
  if (slug === '') return 'Start here';
  if (sectionHubs.has(slug)) return 'Topic hubs';
  const last = slug.split('/').pop();
  if (/^(about|contact|privacy|terms|disclaimer|editorial|affiliate|how-we|methodology|authors?)(\b|-|$)/.test(last)) return 'About this site';
  if (/(^|-)vs(-|$)/.test(last)) return 'Comparisons';
  if (/^best-|-best-|^top-/.test(last)) return 'Buying guides';
  if (/(^|-)(review|reviews)(-|$)/.test(last) || slug.startsWith('reviews/')) return 'Reviews';
  if (/^(how|what|why|when|where|which|who|can|do|does|did|is|are|should|will|could|would)-/.test(last)) return 'Answers and how-tos';
  return 'Guides';
}

const ORDER = ['Start here', 'Topic hubs', 'Buying guides', 'Reviews', 'Comparisons', 'Answers and how-tos', 'Guides', 'About this site'];

function llmsTxt(pages, origin) {
  const home = pages.find((p) => p.url.pathname.replace(/\/+$/, '') === '');
  const name = home?.siteName || home?.title || origin;
  const intro = home?.description || '';
  // A top-level path that other pages sit under counts as a hub.
  const parents = new Set(pages.map((p) => p.url.pathname.split('/').filter(Boolean)).filter((s) => s.length > 1).map((s) => s[0]));

  const groups = new Map();
  for (const p of pages) {
    const g = section(p.url.pathname, parents);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(p);
  }

  const lines = [`# ${name}`, ''];
  if (intro) lines.push(`> ${intro}`, '');
  lines.push(
    `Every page on ${origin.replace(/^https?:\/\//, '')} has a plain Markdown copy: add \`.md\` to the page URL (the home page is \`/index.md\`). Each copy starts with the page's title, description, canonical URL and last-updated date. The list below links to the Markdown copies.`,
    '',
  );
  for (const g of ORDER) {
    const list = groups.get(g);
    if (!list) continue;
    list.sort((a, b) => a.url.pathname.localeCompare(b.url.pathname));
    lines.push(`## ${g}`, '');
    for (const p of list) {
      const desc = p.description ? `: ${p.description}` : '';
      lines.push(`- [${p.title.replace(/[[\]]/g, '')}](${origin}${p.mdPath})${desc}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------- main

function main() {
  try { statSync(HTML_DIR); } catch {
    console.error(`build-markdown: ${HTML_DIR} not found. Run the site build first.`);
    process.exit(1);
  }
  const pages = [];
  let skipped = 0;
  for (const file of walk(HTML_DIR)) {
    const rel = relative(HTML_DIR, file).split(sep).join('/');
    if (SKIP_FILES.test(rel)) continue;
    const route = '/' + rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
    const page = convert(readFileSync(file, 'utf8'), new URL(route, SITE).toString());
    if (!page) { skipped++; continue; }
    const target = join(OUT_DIR, page.mdPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, page.md);
    pages.push(page);
  }
  if (!pages.length) {
    console.error('build-markdown: no pages converted.');
    process.exit(1);
  }
  const origin = pages[0].url.origin;
  writeFileSync(join(OUT_DIR, 'llms.txt'), llmsTxt(pages, origin));
  console.log(`build-markdown: wrote ${pages.length} Markdown pages and llms.txt to ${OUT_DIR} (${skipped} skipped: noindex, duplicate or empty).`);
}

main();
