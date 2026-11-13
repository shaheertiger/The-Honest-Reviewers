---
name: daily-amazon-guide
description: The daily traffic-led Amazon buyer's guide. Pulls the last 7 days of Vercel Web Analytics, finds the niche that is getting the most traffic, writes ONE new Amazon buyer's guide (a "best X" roundup) in that niche, wires it in, runs every gate and pushes to main. Use when the daily Amazon guide scheduled task fires, or when asked to run it manually.
---

# Daily Amazon buyer's guide

One roundup a day, placed next to whatever readers are actually reading this week.
Traffic decides the niche; the guide is a product the readers of that page would
plausibly buy next on Amazon.

## 1. Pull 7 days of traffic from Vercel

Use the Vercel MCP tool `aggregate_pageviews` (load it with ToolSearch if needed):

```jsonc
{
  "projectId": "prj_leSCvblpX2i7PAQKRXt6nEuoJQYK",   // the-honest-reviewers
  "teamId": "team_pAoikpyeUpvHszE2JvWQKq7c",
  "by": ["requestPath"],
  "since": "<today minus 7 days>T00:00:00.000Z",
  "until": "<today>T00:00:00.000Z",
  "limit": 50
}
```

Save the result as `content/analytics/top-pages-<since>-to-<until>.csv` with the header
`Page,Visitors,Total` (visitors, pageviews), highest first, dropping the `Others` row
and `/`. That file is the record of what the run worked from — see
`content/analytics/README.md`.

If the Vercel call fails (auth, not found), stop and report it. Do not guess traffic
and do not fall back to an old CSV.

## 2. Pick the niche and the guide

1. Take the top pages in order. For each, its niche is the product category it is
   about (`/best-solar-power-bank` → solar / outage power; `/how-to-get-oil-out-of-concrete`
   → oil on concrete; `/milwaukee-vs-dewalt` → cordless tools).
2. For the highest-traffic niche, list Amazon products a reader of that page would buy
   next that the site does **not** already have a roundup for. Check
   `ls src/pages/ | grep <keyword>` and `grep -ril "<keyword>" src/pages` for every
   candidate — a slug that exists, or a page whose first tag is the same keyword, is
   taken.
3. Also check the last few `content/semrush/*.md` batch notes and
   `git log --oneline -15` so you do not re-cover something written recently.
4. If the top niche has no honest gap left, move to the next niche down. Pick
   **one** guide. Prefer a real commercial query ("best X", "best X for Y") with an
   obvious Amazon category behind it.

## 3. Write it

Use the roundup scaffolder — the pillar format with a `PRODUCTS` array, QuickPicks and
product cards:

```bash
node scripts/scaffold-roundup.mjs <scratchpad>/spec.json
```

Read `scripts/scaffold-roundup.mjs` and one recent roundup it produced (for example
`src/pages/best-concrete-degreaser.astro`) for the exact spec fields; they are the
article spec from `.claude/skills/daily-publish/SKILL.md` plus `products` and
`picksAfter`. Each product needs `id, name, category, badge, rating, reviewCount,
description, pros, cons, bottomLine, amazonUrl`.

### Format to follow: the pages that hold their rankings

Model every guide on `src/pages/best-vinyl-plank-flooring.astro`,
`src/pages/best-gas-water-heater.astro` and `src/pages/how-to-get-oil-out-of-concrete.astro`.
These are the site's best-ranking pages and they hold position. **Read at least one of
them before writing.** What they do that generic roundups don't:

- **Every H2 answers its own search query.** Sections are the questions people search
  next to the main keyword: "X vs Y", "Is X waterproof?", "How to install X", "How to
  clean X", "What size X do I need", "Why X fails and how to delay it". The heading
  states the answer: "Wear Layer: The Only Durability Number That Matters",
  "Is Vinyl Plank Waterproof? Yes, With One Caveat", "Fresh Spills: The First 30 Minutes".
- **H3 subsections inside most H2s.** 2-5 per section: one per type ("SPC", "WPC",
  "How to Choose"), per household size ("One to Two People", "Five or More"), or per
  step ("Step 1: Blot, Never Wipe"). Use `{ "type": "h3" }` blocks. A section that is
  just four paragraphs with no H3s is the old format, so don't write it that way.
- **One explainer before the picks when the buyer needs it to choose.** The gas water
  heater page puts "First Hour Rating" and venting types before the rankings
  (`picksAfter: 2`); vinyl plank puts picks first (`picksAfter: 0`) and a comparison
  table straight after. Pick whichever order lets the reader understand the ranking.
- **A comparison table of the picks** (Product / Type / Key spec / Best for) as a
  `table` block at the end of the section just before the picks, so the reader sees all the picks at a
  glance.
- **7 products where the category supports 7 real ones** (5 minimum). Each gets **5
  pros, 3 cons** and a **200-235 word description**: who it is for, the one spec
  that matters and why, the real trade-off, and when to buy something else.
- **Title pattern:** `<N> Best <Product> in <year>: <the deciding factor>`, e.g.
  "7 Best Gas Water Heaters in 2026: Tank Models Tested". Our daily guides have **no
  lab data**, so never write "Tested" or "Tested & Ranked". Use the deciding factor
  instead: "...in 2026: Wear Layer, Core and Real Waterproofing".
- **FAQ is 6-7 real People-Also-Ask questions**, each answer 50-70 words, the first
  one always "What is the best <product>?". **Mistakes: 4-5**, each named after
  the behaviour ("Shopping by Gallons Instead of First Hour Rating").
- **About 2,750-2,900 words of body prose**, the same as those pages.

Rules (same house rules as `daily-publish`):

- `published` is today. Section, voice and title pattern follow the cluster's pillar.
- **2,500 words of body prose is a hard gate.** Product frontmatter does not count, so
  write 8-9 body sections of real paragraphs, 7 FAQ answers, 5 mistakes. Aim 2,800.
- **Real products only.** 5-8 products that actually exist and sell on Amazon today.
  Never invent a product, price, spec or test result. Where there is no lab data, say
  "rated for", "the label specifies", "owners commonly report".
- `amazonUrl`: use the tagged search format the other roundups use until an exact
  ASIN is matched (copy it from an existing roundup).

## 4. Wire it in

- Link it from the **top-traffic page that chose it** (one sentence + link in the body,
  or a card in its related block) and from the cluster pillar's cluster grid.
- The guide links to the pillar, the top-traffic page and at least one more sibling.
- Add a row to the matching category in `src/pages/best-of.astro`.
- Add the slug to `priorityGuides` in `astro.config.mjs`.
- Run `npm run interlinks`; fix false pairings via `scripts/link-blocklist.json`.

## 5. Gates

```bash
npm run validate:all
```

```bash
npm run build
```

Fix until both pass. Never weaken a validator. If the guide cannot reach 2,500 honest
words, pick a different product category.

Then `npm run images:status`; if credentials exist run `npm run images:fetch:all` and
`npm run images:review`. That fetch touches products across the **whole site**, so:

- Commit matches for **today's products only**. Restore everything else
  (`git checkout -- src/data/product-asins.json src/data/product-images.json scripts/product-image-asins.json scripts/all-products-match-report.json`)
  and re-add just today's ids to the two `src/data` files.
- Check each of today's matched Amazon titles names the **exact model** in the guide.
  The matcher happily returns a sibling model (TT20 for TC20, HL 5-X for HL-X), a
  newer variant (EDC27 UHi for EDC27) or an accessory (a charging cable). Drop any
  of those; a tagged search for the right product beats a confident wrong link.

If there are no credentials, skip it and say so.

## 6. Record and publish

Append a short note to `content/semrush/daily-amazon-guides.md` (create it if missing):
date, slug, primary keyword, the top-traffic page and its 7-day visitors that chose it.

```bash
git add -A
git commit -m "Add daily Amazon guide: <slug>"   # + the standard trailers
git push origin HEAD:main
```

Straight to `main` — that is this site's configured workflow; Vercel deploys and
`postbuild` submits IndexNow. Retry the push on network errors only (2s, 4s, 8s, 16s).
If `main` moved, `git pull --rebase origin main`, re-run the gates, then push.

## 7. Report

The 7-day top 5 pages with visitors, the niche chosen and why, the slug published,
gate results, and anything skipped. Never push a guide that failed a gate.

## Guardrails

- **One guide per run.** Never more.
- Never edit an existing article except to add links to the new guide.
- If today's guide already exists on `main` (the task fired twice), stop and report.
