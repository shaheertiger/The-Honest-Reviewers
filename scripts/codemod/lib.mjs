// Shared helpers for the one-time format normalisation codemod.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const PAGES_DIR = join(import.meta.dirname, '..', '..', 'src', 'pages');
export const SITE = 'https://www.thehonestreviewers.com';

export const read = (slug) => readFileSync(join(PAGES_DIR, `${slug}.astro`), 'utf-8');

/** Indentation used by the line containing `index`. */
export function indentAt(source, index) {
  const lineStart = source.lastIndexOf('\n', index) + 1;
  return source.slice(lineStart, index).match(/^\s*/)[0];
}

/** Re-indent a template block (authored at zero indent) to sit at `pad`. */
export function reindent(block, pad) {
  return block
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n');
}

/**
 * Index just past the `>` that closes the tag starting at `open`.
 * String-aware so that `>` inside an attribute value does not end the tag.
 */
function endOfOpenTag(source, open) {
  let quote = null;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '>') return i + 1;
  }
  throw new Error('unterminated tag');
}

/**
 * Given the index of a `<div` open tag, return the index at which its matching
 * `</div>` starts. Counts nested divs only; other elements are ignored.
 */
export function matchingDivEnd(source, open) {
  let depth = 0;
  let i = open;
  while (i < source.length) {
    const nextOpen = source.indexOf('<div', i);
    const nextClose = source.indexOf('</div>', i);
    if (nextClose === -1) throw new Error('unbalanced <div>');
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = endOfOpenTag(source, nextOpen);
    } else {
      depth--;
      if (depth === 0) return nextClose;
      i = nextClose + 6;
    }
  }
  throw new Error('unbalanced <div>');
}

/** The `<div class="prose ...">` wrapper that holds the article body. */
export function proseDiv(source) {
  // The class attribute is sometimes wrapped onto its own line by the formatter.
  const attr = source.search(/class="prose prose-lg prose-blue/);
  if (attr === -1) throw new Error('no prose container');
  const open = source.lastIndexOf('<div', attr);
  if (open === -1) throw new Error('no prose container');
  return { open, contentStart: endOfOpenTag(source, open), end: matchingDivEnd(source, open) };
}

/** Start indices of the direct `<div>` children of the prose container. */
export function proseChildren(source) {
  const { contentStart, end } = proseDiv(source);
  const children = [];
  let i = contentStart;
  while (i < end) {
    const next = source.indexOf('<div', i);
    if (next === -1 || next >= end) break;
    children.push(next);
    i = matchingDivEnd(source, next) + 6;
  }
  return children;
}

/**
 * Where new trailing sections should go: before the page's closing call-to-action
 * block if it has one, otherwise at the very end of the article body.
 */
export function tailInsertPoint(source) {
  const { end } = proseDiv(source);
  const children = proseChildren(source);
  const last = children[children.length - 1];
  if (last === undefined) return end;
  const block = source.slice(last, matchingDivEnd(source, last));
  const isCta = /inline-block px-10 py-5|text-center/.test(block) && !/Bottom Line/.test(block);
  return isCta ? last : end;
}

/** Balance the braces of an object literal starting at `open` (`{`). */
export function matchingBrace(source, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  throw new Error('unbalanced braces');
}

/** Pull the on-page FAQ question/answer pairs out of the rendered markup. */
export function extractFaqs(source) {
  const heading = source.search(/<h2[^>]*>\s*(?:\d+\.\s*)?Frequently Asked Questions/);
  if (heading === -1) return [];
  const listAttr = source.slice(heading).search(/<div class="space-y-\d/);
  if (listAttr === -1) return [];
  const list = heading + listAttr;
  const block = source.slice(list, matchingDivEnd(source, list));

  const faqs = [];
  const question = /<h[34][^>]*>([\s\S]*?)<\/h[34]>\s*<p[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = question.exec(block))) {
    faqs.push({ question: clean(m[1]), answer: clean(m[2]) });
  }
  return faqs;
}

/** Markup/entity soup to a plain JSON-LD-safe string. */
export function clean(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&bull;/g, '•')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** A JS string literal, double-quoted, safe to paste into the .astro frontmatter. */
export const lit = (value) => JSON.stringify(value);

/** Breadcrumb section label inferred from the slug. */
export function categoryFor(slug) {
  if (/-vs-|vs-/.test(slug)) return 'Comparisons';
  if (/^how-|^can-you-|^when-|^why-|^what-/.test(slug)) return 'How-To Guides';
  if (/cost$|-cost-|^how-much/.test(slug)) return 'Cost Guides';
  if (/review/.test(slug)) return 'Reviews';
  if (/^best-/.test(slug)) return 'Best Lists';
  return 'Guides';
}

/** Author and publication metadata already declared on the page. */
export function pageMeta(slug, source) {
  const author =
    (source.match(/author:\s*\{[^}]*name:\s*"([^"]+)"/s) || source.match(/author:\s*"([^"]+)"/) || [])[1] ||
    'Alex Rivers';
  const published =
    (source.match(/datePublished:\s*"([^"]+)"/) || source.match(/publishedTime:\s*"([^"]+)"/) || [])[1] ||
    '2026-08-12';
  const modified =
    (source.match(/dateModified:\s*"([^"]+)"/) || source.match(/modifiedTime:\s*"([^"]+)"/) || [])[1] || published;
  const title = (source.match(/const title\s*=\s*\n?\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || slug;
  return { author, published, modified, title: title.replace(/\\"/g, '"'), slug };
}

/** "August 12, 2026" for the byline. */
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
