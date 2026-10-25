#!/usr/bin/env node
/**
 * Makes the built site readable by AI agents. Runs after `astro build` and writes
 * into dist/:
 *
 *   <page>.md        a Markdown copy of every indexable page (/foo/ -> /foo.md,
 *                    the home page -> /index.md)
 *   md-catalog.json  every Markdown route, served at /api/md/_catalog by middleware.js
 *   llms.txt         site index for agents (llmstxt.org)
 *   llms-full.txt    the most important pages' Markdown joined into one file
 *   ai.txt           how AI systems may use the content
 *   robots.txt       crawler rules, including the AI crawlers
 *
 * The pages here are hand-built .astro files with their content inline, so there is
 * no data layer to render from: the Markdown is converted from each page's rendered
 * <main>, which keeps it identical to what readers see. Site identity (name, URL,
 * description, contact) is read from the home page's Organization JSON-LD, so
 * llms.txt, ai.txt and the structured data cannot disagree.
 *
 * Fails the build if a URL in the sitemap ends up without a Markdown copy.
 *
 * Usage: node scripts/build-markdown.mjs [--html dist] [--site https://www.example.com]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const DIST = arg('html', 'dist');
// Used for pages that have no <link rel="canonical">.
const SITE = arg('site', 'https://placeholder.invalid');

// llms-full.txt stays under this many characters; the rest is listed in llms.txt.
const FULL_LIMIT = 500_000;
// Links per section in llms.txt before pointing to the full catalog.
const LLMS_SECTION_CAP = 50;

// ---------------------------------------------------------------- crawler policy
// Keep in sync: robots.txt, llms.txt and ai.txt are all written from these lists.

// AI search and user-initiated fetchers. They decide whether answer engines can
// cite the site, so they are always allowed.
const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
// Model-training crawlers. Blocking one does not stop citations by the search bots above.
const TRAINING_ALLOWED = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended'];
const TRAINING_BLOCKED = ['CCBot', 'Bytespider'];
// Paths that are not content, for every crawler.
const PRIVATE_PATHS = ['/api/'];
const PUBLIC_EXCEPTIONS = ['/api/md/'];

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

const SKIP_FILES = /(^|\/)(404|500)(\/index)?\.html$/;
const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const day = (d) => (/^\d{4}-\d{2}-\d{2}/.test(d ?? '') ? d.slice(0, 10) : '');
const today = new Date().toISOString().slice(0, 10);

/** /foo/ or /foo -> /foo.md ; / -> /index.md */
export function markdownPath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '/index.md' : `${p}.md`;
}

const meta = (doc, selector) => clean(doc.querySelector(selector)?.getAttribute('content'));

function jsonLdNodes(doc) {
  const nodes = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push(node);
    if (node['@graph']) visit(node['@graph']);
  };
  for (const s of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    try { visit(JSON.parse(s.textContent)); } catch { /* ignore malformed blocks */ }
  }
  return nodes;
}
const typeIs = (node, type) => [].concat(node['@type']).includes(type);

// ---------------------------------------------------------------- converter

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  linkStyle: 'inlined',
});
turndown.use(gfm);

// In-page "#anchor" links point nowhere in a .md file: keep their text only.
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

// Elements that carry no reading content.
const STRIP = [
  'script', 'style', 'noscript', 'template', 'svg', 'canvas', 'iframe', 'video', 'audio',
  'form', 'button', 'input', 'select', 'textarea', 'dialog', 'nav', 'ins',
  '[aria-hidden="true"]', '[hidden]', '.adsbygoogle', '[data-md-skip]',
].join(',');

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
  // Jump-button groups: a block holding nothing but "#section" links.
  for (const a of Array.from(root.querySelectorAll('a[href^="#"]'))) {
    const parent = a.parentNode;
    if (parent && parent.nodeName === 'DIV' && !hasOwnText(parent) &&
        Array.from(parent.children).every((c) => c.nodeName === 'A' && (c.getAttribute('href') || '').startsWith('#'))) a.remove();
  }
  // Badges and labels set side by side ("Model Review", "Updated 2026"): separate them.
  for (const el of Array.from(root.querySelectorAll('div > span, div > a'))) {
    const next = el.nextSibling;
    if (next && next.nodeType === 1 && /^(SPAN|A)$/.test(next.nodeName) && !hasOwnText(el.parentNode)) {
      el.parentNode.insertBefore(doc.createTextNode(' · '), next);
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

/** Drop the hero labels above the H1 ("Independent Buying Guide", badges). */
function dropBeforeH1(root, h1) {
  const before = [];
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* SHOW_TEXT */);
  let text = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (h1.contains(n)) break;
    text += clean(n.nodeValue).length;
    before.push(n);
  }
  if (text > 0 && text < 200) before.forEach((n) => n.remove());
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
    // Drop avatars, icons, placeholders and images without a description.
    if (!src || !clean(el.getAttribute('alt')) || (w && w <= 96) || src.startsWith('data:') || /picsum\.photos|placehold\.co/.test(src)) {
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

  const nodes = jsonLdNodes(doc);
  const siteName = meta(doc, 'meta[property="og:site_name"]') || clean(nodes.find((n) => typeIs(n, 'Organization'))?.name);
  const rawTitle = meta(doc, 'meta[property="og:title"]') || clean(doc.querySelector('title')?.textContent);
  const escaped = siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // "Page title | Site Name" -> "Page title"
  const title = siteName ? rawTitle.replace(new RegExp(`\\s+[|\\u2013\\u2014-]\\s+${escaped}$`), '') : rawTitle;
  const description = meta(doc, 'meta[name="description"]') || meta(doc, 'meta[property="og:description"]');
  const aiSummary = meta(doc, 'meta[name="ai-summary"]') || description;
  const modified = day(meta(doc, 'meta[property="article:modified_time"]')) ||
    day(nodes.map((n) => n.dateModified).find(Boolean)) ||
    day(meta(doc, 'meta[property="article:published_time"]')) ||
    day(nodes.map((n) => n.datePublished).find(Boolean));
  const breadcrumbs = (nodes.find((n) => typeIs(n, 'BreadcrumbList'))?.itemListElement ?? [])
    .map((item) => ({ name: clean(item.name ?? item.item?.name), href: item.item?.['@id'] ?? item.item?.url ?? item.item }))
    .filter((c) => c.name && typeof c.href === 'string');

  for (const el of Array.from(main.querySelectorAll(STRIP))) el.remove();
  tidy(main);
  toAbsolute(main, url);

  // The page heading becomes the Markdown title; the hero labels above it go.
  const h1 = main.querySelector('h1');
  const heading = clean(h1?.textContent) || title;
  if (h1) {
    dropBeforeH1(main, h1);
    h1.remove();
  }

  const body = turndown.turndown(main.innerHTML)
    .replace(/^(#+ \d+)\\\./gm, '$1.') // "## 1\. Title" -> "## 1. Title"
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
  if (body.length < 50) return null;

  // Related: the page's place in the site, from its breadcrumb trail.
  const related = breadcrumbs
    .map((c) => ({ ...c, href: new URL(c.href, url).toString() }))
    .filter((c) => c.href !== url.toString());

  const md = [
    `# ${heading}`,
    description && `> ${description}`,
    [`Canonical: ${url}`, modified && `Last updated: ${modified}`].filter(Boolean).join('\n'),
    body,
    related.length && `## Related\n\n${related.map((c) => `- [${c.name.replace(/[[\]]/g, '')}](${c.href})`).join('\n')}`,
  ].filter(Boolean).join('\n\n') + '\n';

  return { url, title, description, aiSummary, siteName, modified, md, mdPath: markdownPath(url.pathname), nodes };
}

// ---------------------------------------------------------------- sections

const linkTitle = (p) => (p.url.pathname === '/' ? 'Home' : p.title.replace(/[[\]]/g, ''));

const SECTION_ORDER = ['Core pages', 'Topic hubs', 'Buying guides', 'Reviews', 'Comparisons', 'Answers and how-tos', 'Guides', 'Optional'];

function sectionOf(pathname, hubs) {
  const slug = pathname.replace(/^\/|\/$/g, '');
  if (slug === '') return 'Core pages';
  const last = slug.split('/').pop();
  if (/^(privacy|terms|cookie|disclaimer|affiliate-disclosure)/.test(last)) return 'Optional';
  if (/^(about|contact|editorial|how-we|methodology|authors?$)/.test(last) || slug.startsWith('authors/')) return 'Core pages';
  if (hubs.has(slug) || /^best-of$/.test(slug)) return 'Topic hubs';
  if (/(^|-)vs(-|$)/.test(last)) return 'Comparisons';
  if (/^best-|-best-|^top-/.test(last)) return 'Buying guides';
  if (/(^|-)reviews?(-|$)/.test(last)) return 'Reviews';
  if (/^(how|what|why|when|where|which|who|can|do|does|did|is|are|should|will|could|would)-/.test(last)) return 'Answers and how-tos';
  return 'Guides';
}

/** Sitemap priority and lastmod per URL, used to rank pages for llms-full.txt. */
function sitemapInfo() {
  const info = new Map();
  for (const file of readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
    const xml = readFileSync(join(DIST, file), 'utf8');
    for (const m of xml.matchAll(/<url>(.*?)<\/url>/gs)) {
      const loc = m[1].match(/<loc>(.*?)<\/loc>/)?.[1];
      if (!loc) continue;
      info.set(new URL(loc).pathname, {
        priority: Number(m[1].match(/<priority>(.*?)<\/priority>/)?.[1] ?? 0.5),
      });
    }
  }
  return info;
}

// ---------------------------------------------------------------- site files

function identity(home) {
  const org = home.nodes.find((n) => typeIs(n, 'Organization')) ?? {};
  const contact = [].concat(org.contactPoint ?? [])[0] ?? {};
  return {
    name: clean(org.name) || home.siteName,
    url: clean(org.url) || home.url.toString(),
    description: clean(org.description) || home.description,
    email: clean(org.email || contact.email),
    contactUrl: clean(contact.url),
    founded: clean(org.foundingDate),
    logo: clean(typeof org.logo === 'string' ? org.logo : org.logo?.url),
  };
}

function llmsTxt(groups, site, origin, total) {
  const contact = site.email || site.contactUrl || `${origin}/`;
  const facts = [
    site.founded && `Founded in ${site.founded}.`,
    'Free to read, with no account or paywall; the site earns affiliate commissions on qualifying purchases, which do not change its verdicts.',
    `${total} pages, each available as Markdown.`,
    `Contact: ${contact}.`,
  ].filter(Boolean).join(' ');

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description} Every page is available as plain Markdown by adding \`.md\` to its URL (the home page is \`/index.md\`) or by requesting it with \`Accept: text/markdown\`.`,
    '',
    facts,
    '',
    '<!-- Keep in sync with /robots.txt and /ai.txt (all three are generated by scripts/build-markdown.mjs). -->',
    '',
  ];
  for (const name of SECTION_ORDER.filter((s) => s !== 'Optional')) {
    const list = groups.get(name);
    if (!list?.length) continue;
    lines.push(`## ${name}`, '');
    for (const p of list.slice(0, LLMS_SECTION_CAP)) lines.push(`- [${linkTitle(p)}](${origin}${p.mdPath})${p.description ? `: ${p.description}` : ''}`);
    if (list.length > LLMS_SECTION_CAP) {
      lines.push(`- [All ${list.length} ${name.toLowerCase()}](${origin}/api/md/_catalog): the full list, ${list.length - LLMS_SECTION_CAP} more than shown here`);
    }
    lines.push('');
  }
  lines.push(
    '## Machine-readable',
    '',
    `- [Full content](${origin}/llms-full.txt): the most important pages' Markdown in one file`,
    `- [Markdown catalog](${origin}/api/md/_catalog): JSON list of every Markdown page with its title, section and last-updated date`,
    `- [Sitemap](${origin}/sitemap-index.xml)`,
    `- [AI usage policy](${origin}/ai.txt)`,
    '',
  );
  const optional = groups.get('Optional');
  if (optional?.length) {
    lines.push('## Optional', '');
    for (const p of optional) lines.push(`- [${linkTitle(p)}](${origin}${p.mdPath})${p.description ? `: ${p.description}` : ''}`);
    lines.push('');
  }
  return lines.join('\n');
}

function llmsFull(groups, site, origin) {
  const header = `# ${site.name} - full content\n> ${site.description}\nGenerated: ${today}\n`;
  const parts = [];
  let size = header.length;
  let included = 0;
  let total = 0;
  const footer = (left) =>
    `\n---\n\nThis file holds ${included} of ${total} pages and is capped at about ${FULL_LIMIT.toLocaleString('en-US')} characters` +
    (left ? `; the other ${left} are listed in ${origin}/llms.txt and ${origin}/api/md/_catalog, and each one is available as Markdown at its URL plus .md.\n` : '.\n');
  // Topic hubs are link lists that llms.txt already covers; full articles use the space better.
  const ordered = SECTION_ORDER.filter((name) => name !== 'Topic hubs').flatMap((name) => groups.get(name) ?? []);
  total = ordered.length;
  for (const p of ordered) {
    const chunk = `\n---\n<!-- source: ${p.url} -->\n${p.md}`;
    if (size + chunk.length > FULL_LIMIT - 400) continue;
    parts.push(chunk);
    size += chunk.length;
    included++;
  }
  const out = header + parts.join('') + footer(total - included);
  if (out.length > FULL_LIMIT) console.warn(`build-markdown: llms-full.txt is ${out.length} characters, over the ${FULL_LIMIT} target.`);
  return out;
}

function aiTxt(site, origin) {
  const contact = site.email || site.contactUrl || `${origin}/`;
  return [
    '# ai.txt — how AI systems may use this site (ai-txt spec v1.1.1)',
    '# Keep in sync with /robots.txt and /llms.txt (all three are generated by scripts/build-markdown.mjs).',
    '',
    '[identity]',
    `name: ${site.name}`,
    `url: ${site.url}`,
    `description: ${site.description}`,
    `contact: ${contact}`,
    '',
    '[permissions]',
    'summarise: allowed',
    'quote: allowed with attribution',
    'cite: allowed',
    'index-for-search: allowed',
    'index-for-answers: allowed',
    '',
    '[restrictions]',
    'fabricated-quotes: not allowed — quote only text that appears on the page',
    'fake-reviews-or-ratings: not allowed — do not invent scores, ratings, test results or prices, or attribute them to us',
    'present-as-own: not allowed — do not present our content as the model\'s own work',
    'stale-facts: prices and specifications change; give the page date and link to the page',
    `training: ${TRAINING_ALLOWED.join(', ')} may use public pages for training; ${TRAINING_BLOCKED.join(', ')} may not (see /robots.txt)`,
    '',
    '[attribution]',
    `format: ${site.name} — <canonical page URL>`,
    'link: cite the canonical HTML page (the "Canonical:" line in each Markdown copy), not the .md URL',
    '',
    '[scope]',
    'include: /',
    `include: ${PUBLIC_EXCEPTIONS.join(', ')} (Markdown copies of public pages)`,
    `exclude: ${PRIVATE_PATHS.join(', ')}`,
    'exclude: pages marked noindex',
    '',
    '[contact]',
    `contact: ${contact}`,
    '',
    `Last updated: ${today}`,
    '',
  ].join('\n');
}

function robotsTxt(origin) {
  const rules = (agents, lines) => [...agents.map((a) => `User-agent: ${a}`), ...lines, ''];
  const publicRules = [...PUBLIC_EXCEPTIONS.map((p) => `Allow: ${p}`), ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`), 'Allow: /'];
  return [
    `# robots.txt for ${origin.replace(/^https?:\/\//, '')}`,
    '# Keep in sync with /llms.txt and /ai.txt (all three are generated by scripts/build-markdown.mjs).',
    `# Site guide for AI agents: ${origin}/llms.txt`,
    `# AI usage policy: ${origin}/ai.txt`,
    '',
    '# AI search and user-requested fetches: these let answer engines cite the site.',
    ...rules(AI_SEARCH_BOTS, publicRules),
    '# AI training crawlers allowed on public pages.',
    ...rules(TRAINING_ALLOWED, publicRules),
    '# AI training crawlers not allowed. This does not affect citations by the search bots above.',
    ...rules(TRAINING_BLOCKED, ['Disallow: /']),
    ...rules(['*'], publicRules),
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');
}

// ---------------------------------------------------------------- main

function main() {
  try { statSync(DIST); } catch {
    console.error(`build-markdown: ${DIST} not found. Run the site build first.`);
    process.exit(1);
  }
  const pages = [];
  for (const file of walk(DIST)) {
    const rel = relative(DIST, file).split(sep).join('/');
    if (SKIP_FILES.test(rel)) continue;
    const route = '/' + rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
    const page = convert(readFileSync(file, 'utf8'), new URL(route, SITE).toString());
    if (!page) continue;
    const target = join(DIST, page.mdPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, page.md);
    pages.push(page);
  }
  const home = pages.find((p) => p.url.pathname === '/');
  if (!home) {
    console.error('build-markdown: no home page found.');
    process.exit(1);
  }
  const origin = home.url.origin;
  const site = identity(home);

  // Every URL in the sitemap must have a Markdown copy.
  const sitemap = sitemapInfo();
  const covered = new Set(pages.map((p) => p.url.pathname));
  const missing = [...sitemap.keys()].filter((p) => !covered.has(p));
  if (missing.length) {
    console.error(`build-markdown: ${missing.length} sitemap URL(s) have no Markdown copy:\n  ${missing.slice(0, 20).join('\n  ')}`);
    process.exit(1);
  }

  // Hubs: the section index pages, one per subdirectory of src/pages.
  const PAGES_DIR = join('src', 'pages');
  const hubs = new Set(
    existsSync(PAGES_DIR)
      ? readdirSync(PAGES_DIR, { withFileTypes: true })
          .filter((e) => e.isDirectory() && existsSync(join(PAGES_DIR, e.name, 'index.astro')))
          .map((e) => e.name)
      : [],
  );
  const groups = new Map();
  for (const p of pages) {
    p.section = sectionOf(p.url.pathname, hubs);
    if (!groups.has(p.section)) groups.set(p.section, []);
    groups.get(p.section).push(p);
  }
  const byPath = (a, b) => a.url.pathname.localeCompare(b.url.pathname);
  for (const list of groups.values()) list.sort(byPath);
  // Most important first: sitemap priority, then most recently updated.
  const rank = (a, b) =>
    (sitemap.get(b.url.pathname)?.priority ?? 0.5) - (sitemap.get(a.url.pathname)?.priority ?? 0.5) ||
    (b.modified || '').localeCompare(a.modified || '') ||
    byPath(a, b);
  for (const name of ['Core pages', 'Topic hubs']) groups.get(name)?.sort((a, b) => (a.url.pathname === '/' ? -1 : b.url.pathname === '/' ? 1 : byPath(a, b)));
  for (const name of ['Buying guides', 'Reviews', 'Comparisons', 'Answers and how-tos', 'Guides']) groups.get(name)?.sort(rank);

  const catalog = SECTION_ORDER.flatMap((name) => groups.get(name) ?? []).map((p) => ({
    url: p.url.toString(),
    markdown: `${origin}${p.mdPath}`,
    title: p.title,
    description: p.description,
    section: p.section,
    lastUpdated: p.modified || null,
    tokens: Math.ceil(p.md.length / 4),
  }));
  writeFileSync(join(DIST, 'md-catalog.json'), JSON.stringify({ site: site.name, generated: today, count: catalog.length, pages: catalog }, null, 2));
  writeFileSync(join(DIST, 'llms.txt'), llmsTxt(groups, site, origin, pages.length));
  const full = llmsFull(groups, site, origin);
  writeFileSync(join(DIST, 'llms-full.txt'), full);
  writeFileSync(join(DIST, 'ai.txt'), aiTxt(site, origin));
  writeFileSync(join(DIST, 'robots.txt'), robotsTxt(origin));

  console.log(`build-markdown: ${pages.length} Markdown pages, llms.txt, llms-full.txt (${full.length.toLocaleString('en-US')} chars), ai.txt, robots.txt and md-catalog.json written to ${DIST}.`);
}

main();
