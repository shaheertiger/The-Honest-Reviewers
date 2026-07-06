import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.thehonestreviewers.com',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      serialize(item) {
        const url = item.url.replace(/\/$/, '');
        const base = 'https://www.thehonestreviewers.com';

        if (url === base || url === `${base}/`) {
          item.changefreq = 'weekly';
          item.lastmod = new Date().toISOString();
          item.priority = 1.0;
        } else if (url === `${base}/best-of`) {
          item.changefreq = 'weekly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-mens-back-shavers`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/braun-type-5544-vs-series-7`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/the-brutal-truth-about-back-hair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/buzz-cut-guide`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/how-to-shave-back-hair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-redwood-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-basement-wall-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-asphalt-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/asphalt-repair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-asphalt-crack-filler`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-concrete-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/asphalt-sealcoating`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-cinder-block-sealer-reviews`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-paint-sprayer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-deck-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-ceiling-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-deck-sealant`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/paint-sprayer-rental`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-paint-brushes`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.5;
        }

        return item;
      },
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
