# Restructure brief: match the site's best-ranking page format

Astro product-review site. Other agents are editing OTHER files in the same working tree at the same time: touch ONLY the files in your list.

Reference pages (read at least one first): src/pages/best-gas-water-heater.astro, src/pages/best-vinyl-plank-flooring.astro, src/pages/how-to-get-oil-out-of-concrete.astro.
Target format:
- Numbered H2 content sections; MOST content sections (aim >= 60%) contain 2-5 H3 subsections (types, sizes, steps "Step 1: ...", scenarios, "Where X Wins"). Skip the product-card section, FAQ, Mistakes, Everything Else, Related, Bottom Line.
- Order near the end: FAQ (H3 per question) -> ONE Mistakes section (H3 per mistake) -> Everything Else / Related -> The Bottom Line.

For each file:
1. Content H2 sections with 3+ paragraphs and no H3: add 2-4 H3s by GROUPING EXISTING paragraphs. Each H3 states what its paragraphs say. Use the page's existing body-H3 class; if none, `<h3 class="text-2xl font-bold text-gray-900 mt-10 mb-4">...</h3>`, indented to match.
2. Two Mistakes sections -> merge into one numbered section after the FAQ (keep every distinct mistake as an H3; drop only exact duplicates). FAQ questions sitting inside Mistakes -> move into the FAQ (keep FAQ JSON-LD consistent). Update the "In This Guide" TOC if you add/move/renumber sections.
3. No "The Bottom Line": add an unnumbered H2 "The Bottom Line" near the end (before MoreInCategory/AuthorBio components) with 2 short paragraphs summarising ONLY the page's own picks/advice. No Mistakes section: add one after the FAQ with 4-5 mistakes (H3 + 45-60 words each) based ONLY on advice the page already gives.
4. NEVER add or change product claims, specs, prices, numbers, test results. Do not delete paragraphs. Short bridging sentences only where a split needs one. Don't touch frontmatter product data.

Verify per file: `node scripts/validate-word-count.js 2>&1 | grep " <slug>.astro"` PASS; `<div` minus `</div>` difference unchanged before/after. At the end run `node scripts/validate-internal-links.js` and `node scripts/format-audit.mjs` (read-only) and confirm they pass.
Do NOT run npm run build / astro build. Do NOT git commit or push. If a file is already fine, leave it.

Report back in under 15 lines: per file one line (sections given H3s count, merges/additions, words before->after), validators status, anything you could not fix.
