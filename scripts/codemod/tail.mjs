// Renders and inserts the three closing sections of the canonical format:
// "Common Mistakes", "Related Guides", and the dark "The Bottom Line" panel.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES_DIR, read, indentAt, reindent, proseChildren, matchingDivEnd, tailInsertPoint } from './lib.mjs';

const CARD_ACCENTS = ['text-[#FF4500]', 'text-[#1E90FF]', 'text-green-600'];

export function faqBlock(items) {
  const cards = items
    .map(
      ({ question, answer }) => `    <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <h3 class="text-lg font-bold text-gray-900 mb-2">${question}</h3>
      <p class="text-gray-700 text-sm leading-relaxed">
        ${answer}
      </p>
    </div>`
    )
    .join('\n');
  return `<!-- FAQ -->
<div id="faq" class="scroll-mt-24">
  <h2 class="text-3xl font-black text-gray-900 mt-16 mb-6">
    Frequently Asked Questions
  </h2>

  <div class="space-y-6">
${cards}
  </div>
</div>
`;
}

export function mistakesBlock({ heading, intro, items }) {
  const cards = items
    .map(
      ({ title, body }) => `    <div class="bg-red-50 border border-red-100 rounded-2xl p-6">
      <h3 class="text-lg font-bold text-red-900 mt-0 mb-2">${title}</h3>
      <p class="text-gray-700 text-sm m-0">
        ${body}
      </p>
    </div>`
    )
    .join('\n');
  return `<!-- Common Mistakes Section -->
<div class="mt-16">
  <h2 class="text-3xl font-black text-gray-900 mb-6">
    ${heading}
  </h2>

  <p>
    ${intro}
  </p>

  <div class="space-y-6 my-8">
${cards}
  </div>
</div>
`;
}

export function relatedBlock({ heading, cards }) {
  const links = cards
    .map(
      ({ href, kicker, title, blurb }, i) => `    <a href="${href}" class="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow no-underline group">
      <p class="${CARD_ACCENTS[i % CARD_ACCENTS.length]} font-black text-xs uppercase tracking-widest mb-2">${kicker}</p>
      <h3 class="text-gray-900 font-bold text-lg group-hover:text-[#1E90FF] transition-colors">${title}</h3>
      <p class="text-gray-500 text-sm mt-2">${blurb}</p>
    </a>`
    )
    .join('\n');
  return `<!-- Related Guides -->
<div class="mt-16">
  <h2 class="text-3xl font-black text-gray-900 mb-6">${heading}</h2>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
${links}
  </div>
</div>
`;
}

export function closingBlock(paragraphs) {
  const body = paragraphs
    .map(
      (text, i) =>
        `  <p class="text-gray-300 leading-relaxed${i === paragraphs.length - 1 ? '' : ' mb-4'}">
    ${text}
  </p>`
    )
    .join('\n');
  return `<!-- Closing -->
<div class="mt-16 bg-gray-900 text-white rounded-2xl p-8">
  <h2 class="text-2xl font-black text-white mb-4">The Bottom Line</h2>
${body}
</div>
`;
}

/** Start index of the article-body child whose heading matches `pattern`. */
function sectionAt(source, pattern) {
  for (const start of proseChildren(source)) {
    const block = source.slice(start, matchingDivEnd(source, start));
    const heading = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    if (heading && pattern.test(heading[1])) return start;
  }
  return -1;
}

function insertAt(source, at, block) {
  const lineStart = source.lastIndexOf('\n', at) + 1;
  const pad = indentAt(source, at);
  return source.slice(0, lineStart) + reindent(block, pad) + '\n' + source.slice(lineStart);
}

/** Add the closing sections a page is missing, each in its canonical position. */
export function applyTail(slug, content) {
  let source = read(slug);

  if (content.faqs && !/id="faq"/.test(source)) {
    const before = [/Common Mistakes/i, /Related [\w &]*Guides/i, /The Bottom Line/i];
    let at = -1;
    for (const p of before) if (at === -1) at = sectionAt(source, p);
    source = insertAt(source, at === -1 ? tailInsertPoint(source) : at, faqBlock(content.faqs));
  }

  if (content.mistakes && !/Common Mistakes/i.test(source)) {
    const before = [/Related [\w &]*Guides/i, /The Bottom Line/i];
    let at = -1;
    for (const p of before) if (at === -1) at = sectionAt(source, p);
    source = insertAt(source, at === -1 ? tailInsertPoint(source) : at, mistakesBlock(content.mistakes));
  }

  if (content.related && !/Related [\w &]*Guides/i.test(source)) {
    const at = sectionAt(source, /The Bottom Line/i);
    source = insertAt(source, at === -1 ? tailInsertPoint(source) : at, relatedBlock(content.related));
  }

  if (content.closing && !/The Bottom Line/i.test(source)) {
    source = insertAt(source, tailInsertPoint(source), closingBlock(content.closing));
  }

  writeFileSync(join(PAGES_DIR, `${slug}.astro`), source);
}
