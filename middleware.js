/**
 * Vercel Routing Middleware: serves the Markdown copy of each page, written into
 * dist/ by scripts/build-markdown.mjs, with the headers AI agents expect.
 *
 *   GET /some-page.md                          -> Markdown of /some-page/
 *   GET /some-page/ + Accept: text/markdown    -> Markdown of /some-page/ (q-values respected)
 *   GET /api/md/some-page                      -> Markdown of /some-page/, always
 *   GET /api/md/_catalog                       -> JSON list of every Markdown page
 *
 * Everything else passes straight through untouched, so browsers, curl and link
 * previews (a wildcard Accept, or none) always get HTML. Uses Web APIs only.
 */

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_astro/|_vercel/|images/).*)'],
};

// Marks the middleware's own request for the static .md file so it isn't handled twice.
const INTERNAL = 'x-markdown-internal';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
};

/** True when the client ranks text/markdown above text/html (RFC 9110 q-values). */
export function prefersMarkdown(accept) {
  if (!accept) return false;
  let markdown = 0;
  let html = -1;
  let text = -1;
  let any = -1;
  for (const part of accept.split(',')) {
    const [type, ...params] = part.split(';').map((s) => s.trim().toLowerCase());
    const qParam = params.find((p) => p.startsWith('q='));
    const parsed = qParam ? Number(qParam.slice(2)) : 1;
    const q = Number.isFinite(parsed) ? parsed : 0;
    if (type === 'text/markdown' || type === 'text/x-markdown') markdown = Math.max(markdown, q);
    else if (type === 'text/html') html = Math.max(html, q);
    else if (type === 'text/*') text = Math.max(text, q);
    else if (type === '*/*') any = Math.max(any, q);
  }
  const htmlQ = html >= 0 ? html : text >= 0 ? text : any >= 0 ? any : 0;
  return markdown > 0 && markdown > htmlQ;
}

/** /some-page/ -> /some-page.md ; / -> /index.md */
function markdownPath(pathname) {
  const p = pathname.replace(/\.md$/, '').replace(/\/+$/, '');
  return p === '' || p === '/index' ? '/index.md' : `${p}.md`;
}

/** Pages whose HTML may be swapped for Markdown: no file extension, not an endpoint. */
function isContentRoute(pathname) {
  return !/\.[a-z0-9]+$/i.test(pathname) && !/^\/(api|_[^/]*|\.well-known)(\/|$)/.test(pathname);
}

function respond(request, body, { status = 200, contentType = 'text/markdown; charset=utf-8', canonical, lastModified, negotiated = false } = {}) {
  const headers = new Headers({
    ...CORS,
    'Content-Type': contentType,
    'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
    'X-Robots-Tag': 'noindex, follow',
    'Cache-Control': status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=300',
  });
  if (canonical) {
    headers.set('Content-Location', canonical);
    headers.set('Link', `<${canonical}>; rel="canonical"`);
  }
  if (lastModified) headers.set('Last-Modified', lastModified);
  if (negotiated) headers.set('Vary', 'Accept');
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

function notFound(request, pathname, negotiated) {
  const origin = new URL(request.url).origin;
  const body = `# Page not found\n\n> There is no Markdown page at ${pathname}.\n\nEvery page on this site is listed in ${origin}/llms.txt and ${origin}/api/md/_catalog.\n`;
  return respond(request, body, { status: 404, negotiated });
}

async function fetchInternal(request, path) {
  return fetch(new URL(path, request.url), { headers: { [INTERNAL]: '1' } });
}

async function serveMarkdown(request, pathname, negotiated) {
  const res = await fetchInternal(request, markdownPath(pathname));
  if (!res.ok) return negotiated ? undefined : notFound(request, pathname, negotiated);
  const body = await res.text();
  const canonical = body.match(/^Canonical: (\S+)$/m)?.[1];
  const updated = body.match(/^Last updated: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  return respond(request, body, {
    canonical,
    lastModified: updated ? new Date(`${updated}T00:00:00Z`).toUTCString() : undefined,
    negotiated,
  });
}

export default async function middleware(request) {
  if (request.headers.get(INTERNAL)) return;
  const { pathname } = new URL(request.url);

  const direct = pathname.startsWith('/api/md/') || pathname === '/api/md';
  const suffix = !direct && pathname.endsWith('.md');
  const negotiated = !direct && !suffix && isContentRoute(pathname) && prefersMarkdown(request.headers.get('accept'));
  if (!direct && !suffix && !negotiated) return;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed\n', { status: 405, headers: { ...CORS, Allow: 'GET, HEAD, OPTIONS' } });
  }

  if (direct) {
    const rest = pathname.replace(/^\/api\/md\/?/, '');
    if (rest.replace(/\/+$/, '') === '_catalog') {
      const res = await fetchInternal(request, '/md-catalog.json');
      if (!res.ok) return notFound(request, pathname, false);
      return respond(request, await res.text(), { contentType: 'application/json; charset=utf-8' });
    }
    return serveMarkdown(request, `/${rest}`, false);
  }
  return serveMarkdown(request, pathname, negotiated);
}
