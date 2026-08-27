# The Honest Reviewers

Astro 5 + Tailwind affiliate review site deployed on Vercel. Every article is a
hand-written `src/pages/<slug>.astro` file that renders at `/<slug>/`.

## Before writing or editing an article page

Read **`docs/ARTICLE-PAGE-SPEC.md`**. It documents the required page structure, the
frontmatter contract, the JSON-LD `@graph`, the SEO conventions, and the writing
standards. The canonical reference implementation is
`src/pages/best-self-propelled-lawn-mower.astro` — when in doubt, copy that file.

## Build gates

`npm run build` runs three validators first; all must pass or the deploy fails.

- `npm run validate:words` — every page needs ≥ 2,500 words of prose
- `npm run validate:links` — internal links must resolve and end in a trailing slash
- `npm run validate:format` — every article page must carry all 13 structural elements

Run `npm run validate:format` after any structural edit; it names the missing elements
per page.

## Things that bite

- A passing build does not mean the page renders correctly. Tailwind breakpoints are
  viewport-based, so a `lg:` grid split inside the `max-w-3xl` column still fires on
  desktop and can clip content. Check wide components in a browser.
- On-page FAQ copy and the `FAQPage` JSON-LD must match exactly — edit them together.
- `SEO.astro` already emits Organization and WebSite JSON-LD; never add them to a page.
- `AdUnit` is injected by `Layout`; pages must not add their own.

## Publishing

After deploy, submit URLs with `npm run indexnow -- --live` (reads the published
sitemap, so run it only once production is serving the change).
