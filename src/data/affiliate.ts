import ASINS from './product-asins.json';

// Amazon Associates store/tracking ID. Public by design — it identifies the
// account a click is credited to and appears in every outbound product link.
export const AMAZON_TAG = 'sktiger-20';

const ASIN_MAP = ASINS as Record<string, string>;

/**
 * Resolves a product's outbound link, best option first:
 *
 *   1. A hand-picked URL on the product itself (a SiteStripe link, say).
 *   2. A direct /dp/<ASIN> product link, when we know the product's ASIN.
 *      ASINs live in src/data/product-asins.json and are filled in by
 *      `npm run images:fetch:all`, which matches products through the Amazon
 *      Creators API and writes both the image and the ASIN.
 *   3. A tagged Amazon search for the product name.
 *
 * Every branch carries the tag, so the click is credited either way. The third
 * exists so a product we have not matched yet still sends the reader somewhere
 * useful instead of rendering a dead link.
 */
export function amazonLink(
  url: string | undefined | null,
  productName: string,
  productId?: string,
): string {
  if (url && url !== '#' && url.startsWith('http')) {
    return url.includes('tag=') ? url : `${url}${url.includes('?') ? '&' : '?'}tag=${AMAZON_TAG}`;
  }
  const asin = productId ? ASIN_MAP[productId] : undefined;
  if (asin) {
    return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}&linkCode=ll1`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&tag=${AMAZON_TAG}`;
}
