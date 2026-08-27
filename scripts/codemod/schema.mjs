// Rewrites each page's JSON-LD into the canonical @graph shape:
// BreadcrumbList + FAQPage + Article, alongside whatever the page already declared.
import { matchingBrace, lit, categoryFor, SITE } from './lib.mjs';

/** "7 Best Self-Propelled Lawn Mowers in 2026: Tested & Ranked" -> "7 Best Self-Propelled Lawn Mowers" */
export function shortTitle(title) {
  return title
    .split(/[:—|]/)[0]
    .replace(/\s*\(\d{4}\)\s*$/, '')
    .replace(/\s+in\s+20\d\d\s*$/i, '')
    .trim();
}

function breadcrumbNode(meta) {
  return `{
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "${SITE}/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: ${lit(categoryFor(meta.slug))},
      item: "${SITE}/best-of/",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: ${lit(shortTitle(meta.title))},
      item: "${SITE}/${meta.slug}/",
    },
  ],
}`;
}

function faqNode(faqs) {
  const questions = faqs
    .map(
      ({ question, answer }) => `    {
      "@type": "Question",
      name: ${lit(question)},
      acceptedAnswer: {
        "@type": "Answer",
        text: ${lit(answer)},
      },
    },`
    )
    .join('\n');
  return `{
  "@type": "FAQPage",
  mainEntity: [
${questions}
  ],
}`;
}

function articleNode(meta) {
  return `{
  "@type": "Article",
  headline: title,
  author: { "@type": "Person", name: ${lit(meta.author)} },
  datePublished: "${meta.published}",
  dateModified: "${meta.modified}",
  publisher: { "@type": "Organization", name: "The Honest Reviewers" },
}`;
}

/** Indent a node literal to sit inside the @graph array. */
const pad = (node, spaces) =>
  node
    .split('\n')
    .map((line, i) => (i === 0 ? ' '.repeat(spaces) + line : line.trim() ? ' '.repeat(spaces) + line : line))
    .join('\n');

export function normalizeSchema(source, meta, faqs) {
  const decl = source.indexOf('const schema');
  if (decl === -1) throw new Error('no schema declaration');
  const objStart = source.indexOf('{', decl);
  const objEnd = matchingBrace(source, objStart);
  const object = source.slice(objStart, objEnd + 1);

  const additions = [];
  if (!/BreadcrumbList/.test(object)) additions.push(breadcrumbNode(meta));
  if (!/FAQPage/.test(object) && faqs.length) additions.push(faqNode(faqs));
  if (!/"@type":\s*"Article"/.test(object)) additions.push(articleNode(meta));
  if (!additions.length) return source;

  let replacement;
  const graphKey = object.indexOf('"@graph"');
  if (graphKey !== -1) {
    const arrayStart = object.indexOf('[', graphKey);
    const inserted = additions.map((node) => pad(node, 4) + ',').join('\n');
    replacement =
      object.slice(0, arrayStart + 1) + '\n' + inserted + object.slice(arrayStart + 1);
  } else {
    // A single top-level node (HowTo, Product, ...): keep it as a graph member.
    const inner = object
      .slice(1, -1)
      .replace(/^\s*"@context":\s*"https:\/\/schema\.org",?\s*$/m, '')
      .replace(/^\s*\n/, '')
      .trimEnd()
      .replace(/,$/, '');
    const body = inner.split('\n').filter((l) => l.trim());
    const base = Math.min(...body.map((l) => l.match(/^ */)[0].length));
    const existing = pad(`{\n${body.map((l) => '  ' + l.slice(base)).join('\n')}\n}`, 4);
    replacement = `{
  "@context": "https://schema.org",
  "@graph": [
${additions.map((node) => pad(node, 4) + ',').join('\n')}
${existing},
  ],
}`;
  }
  return source.slice(0, objStart) + replacement + source.slice(objEnd + 1);
}
