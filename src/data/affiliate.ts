import ASINS from './product-asins.json';
import QUARANTINE from './asin-quarantine.json';
import SIMILAR from './product-similar-asins.json';

// Amazon Associates store/tracking ID. Public by design — it identifies the
// account a click is credited to and appears in every outbound product link.
export const AMAZON_TAG = 'sktiger-20';

const ASIN_MAP = ASINS as Record<string, string>;

// Products whose stored ASIN was verified against the live Amazon catalogue and
// found to be either withdrawn or pointing at a different product than the one
// the page names. Built by scripts/build-asin-quarantine.mjs from the GetItems
// report. The ASINs stay in product-asins.json so they can be corrected later;
// this list only stops them being used as a direct product link in the meantime.
const QUARANTINED = new Set(Object.keys(QUARANTINE as Record<string, unknown>));

// Fallback listings for products Amazon does not carry under their own model
// number (discontinued, dealer-only, or only sold as a kit or newer revision).
// Each maps to the closest equivalent listing — same brand and product type where
// one exists — chosen by hand. Kept separate from product-asins.json so an exact
// match always wins and the quarantine never touches these.
type SimilarEntry = { asin: string; title?: string; relation?: string };
const SIMILAR_MAP = SIMILAR as Record<string, SimilarEntry>;

// A short, readable name for an alternative listing: the Amazon title up to its
// first separator, capped so the note under a button stays one or two lines.
function shortTitle(title: string): string {
  const head = title.split(/\s[|–—]\s|,\s/)[0].trim();
  return head.length > 80 ? `${head.slice(0, 77).trimEnd()}…` : head;
}

// A link to an alternative carries the alternative's name in the URL fragment
// (#alt=...). Browsers never send the fragment to Amazon, so tracking is
// unaffected, and Layout.astro reads it to print a note under the button telling
// the reader the button opens a different product than the one reviewed.
function altFragment(entry: SimilarEntry): string {
  if (entry.relation === 'exact' || !entry.title) return '';
  return `#alt=${encodeURIComponent(shortTitle(entry.title))}`;
}

/**
 * Resolves a product's outbound link, best option first:
 *
 *   1. A hand-picked URL on the product itself (a SiteStripe link, say).
 *   2. A direct /dp/<ASIN> product link, when we know the product's ASIN and it
 *      is not quarantined.
 *      ASINs live in src/data/product-asins.json and are filled in by
 *      `npm run images:fetch:all`, which matches products through the Amazon
 *      Creators API and writes both the image and the ASIN.
 *   3. A direct link to the closest equivalent listing, when the exact product
 *      has no usable listing (src/data/product-similar-asins.json). Unless the
 *      entry is marked "exact", the link is flagged so the page says it opens
 *      an alternative.
 *   4. A tagged Amazon search for the product name.
 *
 * Every branch carries the tag, so the click is credited either way. The last
 * exists so a product we have not matched yet — or one whose match we no longer
 * trust — still sends the reader to the right product on Amazon rather than to a
 * dead page or the wrong item.
 */
export function amazonLink(
  url: string | undefined | null,
  productName: string,
  productId?: string,
): string {
  if (url && url !== '#' && url.startsWith('http')) {
    return url.includes('tag=') ? url : `${url}${url.includes('?') ? '&' : '?'}tag=${AMAZON_TAG}`;
  }
  const asin = productId && !QUARANTINED.has(productId) ? ASIN_MAP[productId] : undefined;
  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}&linkCode=ll1`;
  }
  const similar = productId ? SIMILAR_MAP[productId] : undefined;
  if (similar?.asin) {
    return `https://www.amazon.com/dp/${similar.asin}?tag=${AMAZON_TAG}&linkCode=ll1${altFragment(similar)}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&tag=${AMAZON_TAG}`;
}
