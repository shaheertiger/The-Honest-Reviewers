// Amazon Associates store/tracking ID. Public by design — it identifies the
// account a click is credited to and appears in every outbound product link.
export const AMAZON_TAG = 'sktiger-20';

/**
 * Resolves a product's outbound link.
 *
 * Pages carry a hand-picked `amazonUrl` where one exists. Where it is still a
 * placeholder, this falls back to a tagged Amazon search for the product name,
 * so the button always goes somewhere useful and the click is still credited,
 * instead of rendering a dead `#`.
 */
export function amazonLink(url: string | undefined | null, productName: string): string {
  if (url && url !== '#' && url.startsWith('http')) {
    return url.includes('tag=') ? url : `${url}${url.includes('?') ? '&' : '?'}tag=${AMAZON_TAG}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&tag=${AMAZON_TAG}`;
}
