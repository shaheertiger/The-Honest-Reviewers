# Bing Ranking Playbook (built from our own data, 28 Nov 2026)

Source data, pulled 28 Nov 2026:
- **Bing Webmaster API**: page, query, traffic and crawl stats for all 34 sites in the account (last ~6 months).
- **Vercel Web Analytics**: search referrers and search landing pages for the last 30 days.

Nothing below is generic SEO advice. Each rule is backed by a number from the sites that win.

---

## 0. Why Bing is the only engine that matters for us

Vercel, thehonestreviewers.com, last 30 days of search-referred visitors:

| Referrer | Visitors |
|---|---|
| duckduckgo.com | 12,484 |
| bing.com | 4,588 |
| search.yahoo.com (+ca/uk/au) | 2,271 |
| search.brave.com | 520 |
| ecosia.org | 142 |
| google.com | **29** |

DuckDuckGo, Yahoo and Ecosia all serve **Bing's index**, so about 97% of our search traffic is decided by Bing.
Optimise for Bing first. Google is noise for these sites right now.

## 1. The scoreboard: who wins and why

Bing clicks over the window the API returns:

| Site | Clicks | Impressions | Indexed pages |
|---|---|---|---|
| **thehonestreviewers.com** | **32,485** | 966,588 | 1,043 |
| bcpnpcalculator.ca | 9,952 | 145,513 | — |
| satcalculator.co | 4,901 | 333,731 | — |
| oldenglishfontgenerator.com | 2,532 | 68,156 | — |
| treadmillreviewsusa.com | 745 | 35,106 | 494 |
| hairgrowthreviews.com | 233 | 10,030 | 208 |
| enthusiastreview.com | 199 | 22,199 | 533 |
| best-proteinpowder.com | 99 | 5,793 | — |

How thehonestreviewers.com grew, in Bing clicks per month: Feb 0 → Mar 226 → Apr 1,190 → May 2,700 → Jun 3,656 → Aug 4,829 →
Oct 5,806. **It went from zero to about 5,000 clicks a month in 4–5 months.** That is the model every review site copies.
treadmillreviewsusa.com is on the same curve, about 3 months behind (Sep 22 → Oct 195 → Nov 525).

### The single biggest lesson: topical depth beats everything

thehonestreviewers.com clicks by topic cluster:

| Cluster | Pages | Bing clicks |
|---|---|---|
| **Driveway / asphalt sealing** | **42** | **9,257** |
| Deck stain / paint / sealant | 14 | 2,966 |
| Garage floor / epoxy | 17 | 2,933 |
| Basement / waterproofing | 13 | 2,229 |
| Generators / backup power | 15 | 1,423 |
| Pavers / polymeric sand | 17 | 1,302 |

The driveway cluster has 42 pages: one pillar ("best asphalt driveway sealer"), plus cost, how-to, timing, pros and cons,
dry time, moss, oil stains, brand reviews and "best X for Y" variants. It brings in **~34% of all site clicks**.
Bing rewards a site that owns **every** question around one topic, not one page per topic.

**Rule 1: build clusters of 15–40 pages around one buying topic before starting a new topic.**

## 2. Page formats that earn clicks (thehonestreviewers.com)

| Format | Pages | Clicks | Clicks/page | CTR |
|---|---|---|---|---|
| Cost guide ("how much does X cost") | 4 | 1,322 | **330** | 4.0% |
| "Best X" roundup | 151 | 19,718 | 131 | 3.7% |
| Single product/brand review | 8 | 966 | 121 | 3.7% |
| How-to | 26 | 2,891 | 111 | 3.4% |
| Question ("when should you…", "is X…") | 9 | 710 | 79 | **7.4%** |
| X vs Y | 20 | 937 | 47 | 4.7% |
| Other | 44 | 1,103 | 25 | 3.3% |

What the other sites confirm:
- treadmillreviewsusa.com's #1 page is a cost guide (`/how-much-does-a-treadmill-cost/`, 8.2% CTR). Next come a conversion
  guide (incline percent vs degrees), a deals page and a troubleshooting page.
- enthusiastreview.com: equivalents charts get about 10 search visitors per page, "best GPU for <CPU>" pages about 0.
- The calculator sites (bcpnp, satcalculator, gravelcalculator) show that **a working tool on the page** pulls 5–20% CTR.
  thehonestreviewers.com already embeds calculators (driveway sealer, sand, generator wattage) inside its articles.

**Rule 2: every cluster needs, in priority order:** (1) a "best X" pillar, (2) a "how much does X cost" page,
(3) 3–6 how-to pages, (4) 2–4 exact-question pages, (5) "best X for <use/surface/climate>" variants,
(6) one "X vs Y" only if Bing already shows impressions for that exact pair.

## 3. CTR by Bing position: you must reach the top 3

thehonestreviewers.com, all queries:

| Avg position | CTR |
|---|---|
| 1 | **27.8%** |
| 2 | 9.4% |
| 3 | 4.4% |
| 4 | 3.5% |
| 5+ | 0.4–1.5% |

Positions 5 and below are nearly worthless. Long-tail "best X for Y" queries win because the site lands at #1–2 for them
(for example "best driveway sealer for asphalt": 24.8% CTR at #2.2; "best driveway sealer consumer reports": 41%).

**Rule 3: target specific long-tail phrasings you can rank top 3 for, instead of head terms at #5.**
**Rule 3b: any page with 300+ impressions and CTR under 1% gets its title and description rewritten before you write
anything new** (for example satcalculator `/highest-sat-score`: 19,150 impressions, 0.4% CTR).

## 4. The winning article template (copy this exactly)

These numbers come from taking apart the HTML of the 13 top-click pages on thehonestreviewers.com.

### 4.1 Title tag (44–62 characters)
Pattern: **`{N} Best {Exact Keyword} in {Year}: {Proof/Benefit}`**
- `7 Best Asphalt Driveway Sealers in 2026: Tested & Ranked`
- `6 Best Polymeric Sands for Pavers in 2026: No Haze, No Weeds`
- `Generac Generator Cost in 2026: $6,500–$13,000 Installed` (cost page: **put the answer in the title**)
- `How Much Does It Cost to Seal a Driveway? (2026 Price Guide)`

Rules: exact keyword in the first 5 words. Include a number and the year. End with a benefit or proof hook. Leave the
brand name out unless the title has room.

### 4.2 Meta description (105–160 characters)
State concrete numbers and the answer: *"Most homeowners pay $9,000-13,000 installed for an 18-22kW Generac, median about $11,200."*
Mention the product types or brands covered. Explain why to trust the list (method, sample size, time frame).

### 4.3 Above the fold, in this order
1. Trust badge plus page-type label ("Buyer's Guide", "Cost Guide", "How-To Guide").
2. **"Updated {Month Year}"** date. It must match `dateModified` in the schema.
3. **H1 = the keyword**, nearly word for word ("The 7 Best Asphalt Driveway Sealers in 2026").
   *hairgrowthreviews.com misses this: its H1 is "The Best Batana Oil for Soft, Strong, Healthy-Looking Hair", and the page
   sits at position 5.4. Put the exact keyword phrase in the H1.*
4. A 2–3 sentence intro that **answers immediately with numbers** (price range, winner, method). No throat-clearing.
5. A quick-picks box (top 3–7 with "Best for…" labels) or an at-a-glance table.

### 4.4 Body structure (numbered H2s)
The winners use 13–22 H2s, numbered "1. 2. 3.", each a full keyword-rich sentence:
```
In This Guide (table of contents with jump links)
1. The 7 Best {X} in {Year} — Ranked          ← product cards: H3 per product, pros/cons, specs, Check Price
2. {X} Buying Guide: {core question}
3. Types of {X}: Which One Is Right for You?
4. How to {use/apply} {X}: The Complete DIY Guide
5. {Timing / prep / sizing / climate} section
6. {X} vs {Y}: What's the Difference?
Before You Buy (checklist)
7. Frequently Asked Questions                  ← 6–12 real Bing queries as questions
8. Common {X} Mistakes
Everything Else About {topic}                  ← links to the rest of the cluster
Related Guides
The Bottom Line                                ← restate the winner and who it suits
```
- **Length**: 3,000–7,500 words (roundups average about 5,500; cost and question pages 2,800–5,000).
- **H3s**: 23–65 per page. Each product, method and FAQ question gets its own H3.
- **Tables**: at least 1 comparison table on roundups, 3–4 on cost pages (price by size, by type, by region, lifetime cost).
- **Images**: 4–7 on roundups (product images). Cost and how-to pages rank fine with none.
- **Affiliate links**: about 15 Amazon links on a 7-product roundup (about 2 per product). Fewer is fine on informational pages.
- **Internal links**: 30–60 unique internal links per page.

### 4.5 Page types inside the template
- **Cost guide**: the answer (range plus median) goes in the title, the description and the first sentence. Add tables by
  size, type and region, a hidden-costs section, DIY vs pro, long-term cost and a "how to lower your quote" section.
- **How-to**: "Step 1 / Step 2" H2s or "Method 1 … Method 6" H2s, a method-comparison table and a prevention section.
  Add `HowTo` schema.
- **Question page** (`/when-should-you-…/`): a "timing at a glance" summary first, then explain the mechanism,
  bust the myth ("the contractor upsell problem"), then give a climate or variant breakdown.
- **X vs Y**: brand overview, head-to-head table, the deciding factor (for example "battery platform"), category-by-category
  winners, price comparison, then a verdict.

### 4.6 Honesty rule (non-negotiable)
The winners say "We tested 15+ sealers over 6 months". **Only write testing claims that are literally true.** Fabricated
testing claims break Bing's Webmaster Guidelines (misleading content) and FTC endorsement rules, and one manual action
wipes out the whole domain. If nothing was tested hands-on, use a true method line with equally concrete numbers:
*"We compared 15 sealers on spec sheets, manufacturer data and 4,000+ owner reviews."* That is the enthusiastreview
house rule, and it should apply on every site.

## 5. Structured data (JSON-LD) on every article

Every winner ships this set: `Article` (or `BlogPosting`) + `Person` (author) + `Organization` (with `ContactPoint`) +
`WebSite` + `BreadcrumbList` + `FAQPage` (`Question`/`Answer`) + `ImageObject`. Add:
- `ItemList` / `ListItem` on every "best X" roundup (the ranked products).
- `HowTo` / `HowToStep` on how-to pages.
- `Product` / `AggregateOffer` on cost or price pages where prices exist (treadmill cost page).
- `dateModified` must be real and match the visible "Updated" date. Winners show dates 0–3 days old.

## 6. Technical SEO checklist (the stack the winner runs)

| Item | Standard | Status |
|---|---|---|
| Canonical host | `https://www.` single host. Apex 301/308 → www | thehonestreviewers.com apex returns **307 (temporary)**: switch to 308/301 |
| Trailing slash | One form only, consistent in links, canonicals and sitemap | honest/treadmill use `/slug/`; hairgrowth has no slash: fine as long as it is consistent |
| `<link rel=canonical>` | Absolute, self-referencing, every page | ✅ |
| Sitemap | `sitemap-index.xml` → `sitemap-0.xml`, every live URL, **real `lastmod`**, listed in robots.txt | ✅ (1,075 URLs on honest) |
| Submit sitemap | Submit in Bing Webmaster Tools → Sitemaps, and re-ping after each publish | — |
| **IndexNow** | Key file at the site root plus a POST of every new or changed URL after deploy (`scripts/submit-indexnow.js`). Bing indexes within hours instead of weeks | ✅ honest; check every site posts on every deploy |
| robots.txt | Allow bingbot, AI search bots (OAI-SearchBot, PerplexityBot, Claude-SearchBot); block only `/api/` | ✅ |
| llms.txt / llms-full.txt / ai.txt | Present, linked via `Link:` header | ✅ all 4 sites |
| Markdown twins | `/{slug}.md` with `rel="alternate" type="text/markdown"` (Copilot and AI answer engines cite these) | ✅ honest, treadmill, enthusiast; **missing on hairgrowth** |
| HSTS / HTTPS | `strict-transport-security` | ✅ |
| Status hygiene | 4xx near 0. Old URLs 301 to the closest live page, or rebuilt when Bing still shows them | enthusiastreview: 42 4xx / 63 crawl errors, so fix or 410 them deliberately |
| Server HTML | Content in the initial HTML (static/SSR), no client-only rendering | ✅ (Astro / Next static) |
| Page weight | Under about 150 KB HTML, ≤2 render-blocking scripts, lazy images below the fold | honest top page 142 KB, 2 scripts |
| og:image | Unique per page if possible (shows in Bing/Copilot cards) | honest uses `og-default.png` everywhere, so add per-page images |

## 7. Site layout and internal linking

- **Flat URLs**: `/{keyword-slug}/` directly under root, with no `/blog/` or `/category/` in the path. Slug = the target keyword
  (`/best-deck-stain-for-pressure-treated-wood/`).
- **Hub and spoke**: the pillar links to every spoke. Every spoke links back to the pillar in the first 200 words, plus
  4–8 sibling spokes. Use blocks named "Everything Else About {topic}", "Related {X} Guides" and "More in {Category}" near the bottom.
- **Category hubs** ("Driveway & Concrete Sealers", "Generators & Backup Power") list every page in the cluster.
- **Anchor text = the target page's keyword** ("best concrete driveway sealer"), never "click here".
- **Breadcrumbs** on every page (visible, plus `BreadcrumbList`).
- **Author box** with name, bio and an author page (`Person` schema). Add an affiliate disclosure on every money page.
- Embed **calculators or tools** in cost and how-to pages where they fit (driveway sealer, sand, generator wattage).
  Tool pages are the highest-CTR format in the whole account.

## 8. Freshness and the daily loop

The winning pages show `dateModified` 0–3 days old and a visible "Updated {Month Year}" date. Bing rewards recency on
"{year}" and "best" queries. The daily loop:

1. **Pull Bing** (`scripts/bing-report.mjs` / `search-report.mjs` / `bing-fetch.mjs`) and **Vercel** search landing pages
   (filter referrer in duckduckgo, bing, yahoo, brave, ecosia).
2. **CTR fixes first**: pages with 300+ impressions and CTR under 1%, or position 4–10. Rewrite the title and description, put the
   exact query in the H1 and first sentence, and add an FAQ for the query.
3. **Rebuild URLs Bing still shows that 301/410** (cheapest win: Bing already ranks them).
4. **Fill the thinnest winning cluster** with the next missing format from Rule 2 (cost → how-to → question → variants).
5. Use Bing queries with impressions as your **FAQ questions and H2 wording**, word for word.
6. Make a real update to the content (new section, prices, FAQ). Then bump `dateModified`, rebuild the sitemap `lastmod` and **IndexNow** the URLs.
7. **Seasonality**: the Vercel top 30 days are generators, power banks, heaters and ice melt (winter). Publish the seasonal
   cluster 4–6 weeks before the season (winter: generators/heat/ice; spring: lawn, deck, sealer; summer: AC, pools).

## 9. Per-site action list (from today's data)

**hairgrowthreviews.com** (233 clicks, 208 indexed, only 1 inbound link)
- Put the exact keyword in every H1 ("Best Batana Oil for Hair Growth in 2026"). Use the numbered `{N} Best X in {Year}` title.
- `/best-batana-oil` (1,933 impressions, position 5.4) and `/best-hair-growth-products` (600 impressions, 2.2% CTR) are close to
  the top 3: give them a CTR rewrite and add more cluster spokes (batana: how to use, does it work, vs castor/rosemary, cost,
  for women, for beards).
- Add Markdown twins (`.md` + `Link` header) and ship `ItemList` schema on roundups.
- Build clusters around the two that already pull clicks: **batana oil** and **pumpkin seed oil**. Add 15+ spokes each before
  starting new topics.
- Health is YMYL, so cite sources (studies) per claim and show a reviewer/credentials box.

**treadmillreviewsusa.com** (745 clicks, growing fastest)
- Cost, conversion, troubleshooting and deals pages work. Copy the cost-guide format to "how much does a {brand} treadmill cost"
  and "walking pad cost", and the troubleshooting format to every brand (NordicTrack, Sole, Horizon, Peloton).
- `/treadmill-pace-and-speed-chart/`: 976 impressions, 0.9% CTR, position 6.2. Needs a CTR rewrite plus an interactive
  pace calculator.

**enthusiastreview.com** (199 clicks)
- Follow `docs/what-works.md`: equivalents charts and brand how-tos only. Clean up the 42 4xx / 63 crawl errors.

**thehonestreviewers.com** (the winner)
- Apex 307 → 308. Add per-page og:image.
- High-impression, low-CTR queries to fix: "basement waterproofing" (6,720 impressions, 0.5%), "polymeric sand" (3,780,
  0.7%, position 6.5), "dehumidifiers for basements" (1,485, 1.1%).

**Calculator sites** (satcalculator.co and others)
- satcalculator: `/highest-sat-score` 19,150 impressions at 0.4%, `/desmos-calculator-sat` 30,155 at 0.6%,
  `/sat-score-range` 64,123 at 1.0%. These are the biggest pure-CTR wins in the whole account. Rewrite titles with the answer
  in them ("Highest SAT Score: 1600 (and What Counts as a Top Score)").

## 10. One-page checklist before publishing

- [ ] Belongs to an existing cluster (or starts one that will get 15+ pages)
- [ ] Slug = keyword, flat, under root
- [ ] Title `{N} Best {Keyword} in {Year}: {Hook}` (or the answer, for cost/question pages), 45–62 characters
- [ ] Description 105–160 characters with numbers and the answer
- [ ] Visible "Updated {Month Year}" date that matches `dateModified`
- [ ] H1 contains the exact keyword
- [ ] First 2–3 sentences answer the query with numbers
- [ ] Quick picks / at-a-glance table above the fold
- [ ] "In This Guide" TOC + 13–22 numbered H2s
- [ ] 3,000+ words, 1+ comparison table (cost pages 3+)
- [ ] FAQ with 6–12 real Bing queries + `FAQPage` schema
- [ ] Common Mistakes + Bottom Line sections
- [ ] Article + Person + Organization + Breadcrumb + FAQ (+ ItemList / HowTo / Product as fits)
- [ ] 30+ internal links: pillar in the first 200 words, 4–8 siblings, related-guides block
- [ ] Only true method/testing claims; affiliate disclosure
- [ ] Sitemap lastmod updated + IndexNow submitted after deploy
