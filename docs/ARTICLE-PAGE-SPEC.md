# The Honest Reviewers — Article Page Spec

**How to use this file.** Paste it into a fresh Claude session that has no context on
this repo, or point Claude at this path. It describes exactly how an article page on
thehonestreviewers.com is built so a new page comes out matching the other 217.

The canonical reference implementation is **`src/pages/best-self-propelled-lawn-mower.astro`**.
When anything here is ambiguous, open that file and copy what it does.

---

## 1. Stack and repo facts

- **Astro 5** + **Tailwind 3**, React only for interactive islands. Deployed on Vercel.
- **One file per URL.** `src/pages/<slug>.astro` → `https://www.thehonestreviewers.com/<slug>/`.
  There is no content collection and no markdown — every article is a hand-written `.astro` page.
- `trailingSlash: 'always'` in `astro.config.mjs`. Every internal link must end in `/`.
- Site URL is `https://www.thehonestreviewers.com`.
- Shared chrome (header, footer, mobile nav, ad slots, analytics) lives in
  `src/layouts/Layout.astro`. Article pages never render their own header or footer.

## 2. The build gates — read this before writing anything

`npm run build` runs three validators before Astro compiles. All three must pass or the
deploy fails. They are the fastest way to check your work:

| Command | Rule |
|---|---|
| `npm run validate:words` | **Every page needs ≥ 2,500 words.** Counted after stripping frontmatter, tags, class attributes and `{expressions}` — so only real prose counts. Excludes `index.astro` and `best-of.astro`. |
| `npm run validate:links` | Every internal `href="/..."`, and every `url:`/`link:`/`href:` string in a data object, must resolve to a real `src/pages/<slug>.astro` **and** end with a trailing slash. |
| `npm run validate:format` | Every article page must contain all 13 structural elements listed in §4. Implemented in `scripts/format-audit.mjs`; it prints exactly which pages are missing which elements. |

Run `npm run validate:format` after any structural edit. It is cheap and catches drift immediately.

## 3. Frontmatter contract

```astro
---
import Layout from "../layouts/Layout.astro";
import TrustBadge from "../components/TrustBadge.astro";
import SocialProof from "../components/SocialProof.astro";

const title = "7 Best Self-Propelled Lawn Mowers in 2026: Tested & Ranked";
const description =
  "We tested 12+ self-propelled mowers on hills, thick grass, and uneven terrain over a full mowing season.";

const PRODUCTS = [ /* see below — roundups only */ ];

const schema = { /* see §6 */ };
---
```

**`title`** — the `<title>` tag. `SEO.astro` appends `" | The Honest Reviewers"` **only if the
result stays under 70 characters**, so write a bare title and let it decide. Front-load the
target keyword; include the year.

**`description`** — the meta description, ~150–160 characters. One concrete sentence about what
was tested and how. Not a summary of the article.

**`PRODUCTS`** — required for roundups ("best X"), omit for how-tos and comparisons. Each entry:

```js
{
  id: "honda-hrx217vka",          // becomes the section anchor; kebab-case
  name: "Honda HRX217VKA",
  category: "Gas, Rear-Wheel Drive, Variable Speed",
  badge: "Best Overall",           // "Best Budget", "Best for Hills", …
  amazonUrl: "#",
  rating: 4.8,                     // feeds Product/aggregateRating
  reviewCount: 4900,
  pros: [ /* 4–5 specific strings */ ],
  cons: [ /* 2–3 honest strings */ ],
  bottomLine: "One or two sentences: who should buy this and why.",
  description: "150–250 words of real testing detail.",
}
```

## 4. Page skeleton — the 13 required elements

Everything lives inside one `<article class="relative overflow-hidden">` and appears in this
order. `validate:format` checks for each item marked ✅.

1. ✅ **Dark hero** — `<div class="bg-gray-900 py-16 lg:py-24 relative overflow-hidden">` with
   the SVG pattern overlay, then `max-w-4xl mx-auto px-4 relative z-10 text-center` containing:
   - ✅ `<TrustBadge />`, centered
   - two pill badges: an orange category pill (`Buyer's Guide` / `Comparison` / `How-To`) and a
     green `Updated <Month> <Year>` pill
   - `<h1 class="text-4xl lg:text-6xl font-black text-white leading-tight mb-8">` with the key
     phrase wrapped in `<span class="text-[#38BDF8]">`
   - a `text-xl text-gray-300` standfirst
   - two CTAs: solid `bg-[#FF4500]` anchored to the top pick, and `bg-white/10` anchored to a
     key section
2. ✅ **Byline strip** — `<!-- Author & Meta -->` then `<div class="max-w-3xl mx-auto px-4 pt-12">`:
   avatar (`https://i.pravatar.cc/150?img=33`), author name, role
   (`Home Improvement Editor`, or `Grooming Editor &bull; 12 Years` for grooming), a `Last Updated`
   date, and ✅ `<SocialProof users="7.9k" />` pushed right with `ml-auto`.
3. ✅ **Contents card** — `<div class="max-w-3xl mx-auto px-4 py-10">` wrapping a
   `bg-gray-50 border border-gray-200 rounded-2xl` card. Heading is the list icon SVG plus the
   exact words **"In This Guide"**. Links go in
   `<nav class="grid grid-cols-1 sm:grid-cols-2 gap-2">`, numbered `1.`, `2.`, … and every entry
   must point at a real anchor on the page. List **every** section, ending with `FAQ`.
4. **Body** — `<div class="max-w-3xl mx-auto px-4 pb-16 lg:pb-24">` containing
   `<div class="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed">`.
   First child is the lead: `<p class="text-2xl font-medium text-gray-900 mb-8 italic">`.
5. **Sections** — each is `<div id="<anchor>" class="scroll-mt-24">` with
   `<h2 class="text-3xl font-black text-gray-900 mt-16 mb-6">`. 6–9 of them, numbered in the
   heading text to match the contents card.
6. ✅ **FAQ** — `<div id="faq" class="scroll-mt-24">`, heading "Frequently Asked Questions",
   then `<div class="space-y-6">` of
   `<div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">` cards, each an `<h3>`
   question and a `<p class="text-gray-700 text-sm leading-relaxed">` answer. 5–7 questions.
   **These must match the FAQPage JSON-LD word for word.**
7. ✅ **Common Mistakes** — `<div class="mt-16">`, an `<h2>` containing the literal phrase
   "Common Mistakes", one intro `<p>`, then `<div class="space-y-6 my-8">` of exactly 4
   `<div class="bg-red-50 border border-red-100 rounded-2xl p-6">` cards, each with an
   `<h3 class="text-lg font-bold text-red-900 mt-0 mb-2">` and a `<p class="text-gray-700 text-sm m-0">`.
8. ✅ **Related Guides** — `<div class="mt-16">` with an `<h2>` matching `Related … Guides`,
   then `grid grid-cols-1 sm:grid-cols-3 gap-4` of three cards linking to real pages. Kicker
   colours cycle `text-[#FF4500]` → `text-[#1E90FF]` → `text-green-600`.
9. ✅ **Closing** — `<div class="mt-16 bg-gray-900 text-white rounded-2xl p-8">` with
   `<h2 class="text-2xl font-black text-white mb-4">The Bottom Line</h2>` and two
   `text-gray-300` paragraphs. Bold the key recommendation with `<strong class="text-white">`.

Also checked by the validator: ✅ `jsonLd={schema}` passed to `<Layout>`, and ✅ `BreadcrumbList`,
✅ `FAQPage` and ✅ `Article` present in the JSON-LD.

## 5. Layout props

```astro
<Layout
  title={title}
  description={description}
  ogType="article"
  article={{
    publishedTime: "2026-08-12",   // ISO date
    modifiedTime: "2026-08-12",
    author: "Alex Rivers",
    section: "Home & Yard Care",
    tags: ["self propelled lawn mower", "lawn care", "home improvement"],
  }}
  jsonLd={schema}
  stickyCta={{ text: "See Best Sealers", link: "/best-driveway-sealer/" }}  // optional
>
```

`Layout` → `SEO.astro` generates for free: `<title>`, meta description, **canonical URL**,
Open Graph, Twitter card, `article:*` meta from the `article` prop, and Organization + WebSite
JSON-LD. Do not hand-write any of those. `noindex` and `ogImage` props exist if needed.

`stickyCta` renders a persistent mobile CTA bar — used on 89 pages. Its `link` is checked by
`validate:links`.

## 6. JSON-LD

One `const schema` object using `@graph`. `SEO.astro` emits Organization and WebSite separately,
so **never** add those here.

```js
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",
          item: "https://www.thehonestreviewers.com/" },
        { "@type": "ListItem", position: 2, name: "Best Lists",
          item: "https://www.thehonestreviewers.com/best-of/" },
        { "@type": "ListItem", position: 3, name: "Best Self-Propelled Lawn Mowers",
          item: "https://www.thehonestreviewers.com/best-self-propelled-lawn-mower/" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [ /* one Question per on-page FAQ, text identical */ ],
    },
    {
      "@type": "Article",
      headline: title,
      author: { "@type": "Person", name: "Alex Rivers" },
      datePublished: "2026-08-12",
      dateModified: "2026-08-12",
      publisher: { "@type": "Organization", name: "The Honest Reviewers" },
    },
    // Roundups only:
    ...PRODUCTS.map((product) => ({
      "@type": "Product",
      name: product.name,
      description: product.description,
      brand: { "@type": "Brand", name: product.name.split(" ")[0] },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    })),
  ],
};
```

Breadcrumb position 2 is always `/best-of/`; only the label changes — `Best Lists`,
`How-To Guides`, `Comparisons`, `Cost Guides`, `Reviews`, or `Guides`.

How-to pages may add a `HowTo` node with `step: [{ "@type": "HowToStep", name: "…" }]` **inside**
the same `@graph` array.

## 7. Components

| Component | Props | Notes |
|---|---|---|
| `TrustBadge.astro` | none | Required, in the hero |
| `SocialProof.astro` | `users: string` (e.g. `"11.2k"`) | Required, in the byline strip |
| `ProductGallery.tsx` | `images: string[]`, `productName`, `badge?` | React island — needs `client:visible` |
| `ScarcityBadge.astro` | `count: number` | Optional |
| `UrgencyTimer.tsx` | — | React island |
| `AdUnit.astro` | `variant?: "in-article" \| "display" \| "top"` | **Injected by `Layout` already** — do not add to a page |

`src/data/product-images.json` maps 179 product ids → Amazon image URLs. Reuse an existing key
where the product already appears elsewhere on the site.

## 8. Writing standards

- **≥ 2,500 words of real prose.** Most pages run 2,600–5,000.
- **Specific over generic.** Every claim should reference a tested condition, a measurement, a
  price band, or a named trade-off. "We tested on a 15-degree slope" beats "works well on hills".
- **Say what is bad.** Every product gets real `cons`. Every Common Mistakes card names a
  concrete failure mode and its fix. The site's positioning is honesty.
- **British-neutral, plain English.** No hype, no exclamation marks, no "unleash"/"game-changer".
- **Em dashes and real punctuation** are fine; the pages use `—` freely.
- Section headings are numbered in the body and mirrored in the contents card.

## 9. Internal linking

- Always `/slug/` with the trailing slash. `validate:links` fails the build otherwise.
- The target page must already exist in `src/pages/`. If you are writing a link to a page you
  plan to add later, add the page first or drop the link.
- 3 Related Guides cards minimum, plus 2–4 contextual in-body links to sibling articles.

## 10. After the page exists

1. `npm run build` — all three validators plus Astro.
2. Add a card for it in **`src/pages/best-of.astro`** so it is reachable from the hub
   (`{ title, description, badge, url: '/slug/' }`).
3. Optionally add the slug to `priorityGuides` in **`astro.config.mjs`** to raise its sitemap
   priority above the 0.5 default.
4. Ship it, then submit to IndexNow: `npm run indexnow -- --live` (reads the published sitemap,
   so only run it **after** the Vercel production deploy is live). `postbuild` auto-submits on
   real production deploys only.

## 11. Mistakes that have actually happened here

- **Assuming a passing build means the page looks right.** It does not. Tailwind breakpoints are
  viewport-based, not container-based, so a `lg:grid-cols-12` split inside the `max-w-3xl` column
  still fires at 1280px and clips its content. If you add or move a wide component, load the page
  in a browser and check nothing overflows the content column.
- **Wide tables without a scroll wrapper.** Anything wider than the column needs
  `overflow-x-auto` on its wrapper and a `min-w-[…]` on the table.
- **FAQ copy drifting from the FAQPage schema.** They must match exactly, or the rich result is
  wrong. Edit both together.
- **Adding Organization/WebSite JSON-LD to a page.** `SEO.astro` already emits both; a second
  copy is a duplicate.
- **Linking without the trailing slash.** Instant build failure.
- **A contents entry with no matching anchor.** Add `id="…"` and `scroll-mt-24` to the section.

## 12. Caveat worth knowing

The `SocialProof` "Join 12.4k others who chose this" counts are **not measured figures** — they
are per-page values chosen to look plausible, and they exist on all 217 pages. They are part of
the established format, so a new page carries one for consistency, but treat the number as
decoration rather than data. If the site ever wires up real analytics, this is the thing to
replace first.
