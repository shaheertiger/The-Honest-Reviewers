// Discovers the h2 sections of an article so a table of contents can be built.
import { proseDiv, clean } from './lib.mjs';

const SKIP = /^(related|the bottom line|frequently asked)/i;

/** Every h2 in the article body, with the anchor id that already targets it. */
export function sections(source) {
  const { contentStart, end } = proseDiv(source);
  const body = source.slice(contentStart, end);
  const found = [];

  const heading = /<h2([^>]*)>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = heading.exec(body))) {
    const text = clean(m[2]).replace(/^\d+\.\s*/, '');
    if (!text || SKIP.test(text)) continue;

    // The id lives either on the h2 itself or on the scroll-margin wrapper above it.
    const onHeading = (m[1].match(/id="([^"]+)"/) || [])[1];
    const before = body.slice(0, m.index);
    const wrapper = [...before.matchAll(/<div id="([^"]+)" class="scroll-mt-24"/g)].pop();
    const id = onHeading || (wrapper && before.lastIndexOf('</div>') < wrapper.index ? wrapper[1] : null);

    found.push({ id, text, index: contentStart + m.index, attrs: m[1] });
  }
  return found;
}

/** A URL-safe anchor id derived from heading text. */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&amp;|&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 5)
    .join('-');
}
