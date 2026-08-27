// The reusable page furniture from best-self-propelled-lawn-mower.astro:
// the byline strip, the table of contents, and the closing sections.
import { indentAt, reindent, proseDiv, longDate } from './lib.mjs';
import { sections, slugify } from './sections.mjs';

const TOC_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';

/** Stable per-page reader count, in the same range the rest of the site uses. */
export function socialProofUsers(slug) {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
  return `${(7 + (hash % 130) / 10).toFixed(1)}k`;
}

export function authorBlock(meta) {
  const role = /back-hair|back-shaver|buzz-cut|shave/.test(meta.slug)
    ? 'Grooming Editor &bull; 12 Years'
    : 'Home Improvement Editor';
  return `<!-- Author & Meta -->
<div class="max-w-3xl mx-auto px-4 pt-12">
  <div class="flex items-center gap-6 border-b border-gray-100 pb-8">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
        <img src="https://i.pravatar.cc/150?img=33" alt="${meta.author}" class="w-full h-full object-cover" />
      </div>
      <div>
        <p class="text-sm font-bold text-gray-900">${meta.author}</p>
        <p class="text-xs text-gray-500 uppercase tracking-widest">${role}</p>
      </div>
    </div>
    <div class="h-10 w-px bg-gray-200 hidden sm:block"></div>
    <div class="hidden sm:block">
      <p class="text-sm font-bold text-gray-900">Last Updated</p>
      <p class="text-xs text-gray-500">${longDate(meta.modified)}</p>
    </div>
    <div class="hidden sm:block ml-auto">
      <SocialProof users="${socialProofUsers(meta.slug)}" />
    </div>
  </div>
</div>
`;
}

export function tocBlock(entries) {
  const links = entries
    .map(
      ({ id, text }, i) =>
        `      <a href="#${id}" class="text-sm text-gray-600 hover:text-[#1E90FF] no-underline py-1 font-medium">${i + 1}. ${text}</a>`
    )
    .join('\n');
  return `<!-- Table of Contents -->
<div class="max-w-3xl mx-auto px-4 py-10">
  <div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 lg:p-8">
    <h2 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
      ${TOC_ICON}
      In This Guide
    </h2>
    <nav class="grid grid-cols-1 sm:grid-cols-2 gap-2">
${links}
    </nav>
  </div>
</div>
`;
}

/** The `<div class="max-w-3xl ...">` that wraps the article body. */
function bodyContainer(source) {
  const { open } = proseDiv(source);
  const container = source.lastIndexOf('<div class="max-w-3xl mx-auto px-4', open);
  if (container === -1) throw new Error('no body container');
  const comment = source.lastIndexOf('<!-- Content -->', open);
  return comment !== -1 && comment > source.lastIndexOf('</div>', container) ? comment : container;
}

export function insertAboveBody(source, blocks) {
  if (!blocks.length) return source;
  const at = bodyContainer(source);
  const pad = indentAt(source, at);
  return source.slice(0, at) + blocks.map((b) => reindent(b, pad).trimStart() + '\n' + pad).join('') + source.slice(at);
}

/**
 * Give every section heading a stable anchor so the table of contents can
 * link to it, and return the entries to render.
 */
export function anchorSections(source) {
  const found = sections(source);
  const used = new Set(found.map((s) => s.id).filter(Boolean));
  const entries = [];
  let offset = 0;
  let out = source;

  for (const section of found) {
    let id = section.id;
    if (!id) {
      const base = slugify(section.text) || 'section';
      id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);

      // Insert the id (and scroll margin) into the existing <h2 ...> attributes.
      const at = section.index + offset;
      const attrsEnd = out.indexOf('>', at);
      const attrs = out.slice(at + 3, attrsEnd);
      const withClass = /class="/.test(attrs)
        ? attrs.replace(/class="/, `class="scroll-mt-24 `)
        : `${attrs} class="scroll-mt-24"`;
      const replacement = `<h2 id="${id}"${withClass}`;
      out = out.slice(0, at) + replacement + out.slice(attrsEnd);
      offset += replacement.length - (attrsEnd - at);
    }
    entries.push({ id, text: section.text });
  }

  if (/id="faq"/.test(out) || /Frequently Asked Questions/.test(out)) {
    entries.push({ id: 'faq', text: 'FAQ' });
  }
  return { source: out, entries };
}

/** Anchor the FAQ heading itself when the page has no wrapper to hang #faq on. */
export function anchorFaq(source) {
  if (/id="faq"/.test(source)) return source;
  const heading = source.search(/<h2([^>]*)>\s*(?:\d+\.\s*)?Frequently Asked Questions/);
  if (heading === -1) return source;
  const attrsEnd = source.indexOf('>', heading);
  const attrs = source.slice(heading + 3, attrsEnd);
  const withClass = /class="/.test(attrs)
    ? attrs.replace(/class="/, 'class="scroll-mt-24 ')
    : `${attrs} class="scroll-mt-24"`;
  return source.slice(0, heading) + `<h2 id="faq"${withClass}` + source.slice(attrsEnd);
}

/** Add a component import to the frontmatter if it is not already there. */
export function ensureImport(source, name) {
  if (new RegExp(`import ${name} from`).test(source)) return source;
  const anchor = source.indexOf('import Layout from "../layouts/Layout.astro";');
  if (anchor === -1) throw new Error('no Layout import');
  const end = source.indexOf('\n', anchor) + 1;
  return source.slice(0, end) + `import ${name} from "../components/${name}.astro";\n` + source.slice(end);
}
