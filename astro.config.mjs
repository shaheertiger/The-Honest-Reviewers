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
        } else if (url === `${base}/basement-crack-repair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/basement-waterproofing-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/polyaspartic-floor-coating`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/cold-patch-asphalt`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/wet-basement-solutions`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/polyurea-garage-floor-coating`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/can-you-stain-pressure-treated-wood`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/driveway-crack-repair`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/epoxy-floor-colors`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/garage-floor-coating-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-garage-floor-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-deck-cleaner`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/asphalt-driveway-maintenance`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/garage-floor-epoxy-colors`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/basement-floor-sealer`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/best-gas-lawn-mowers`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/interior-basement-waterproofing`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/best-basement-floor-paint`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/blacktop-sealer-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-oil-based-deck-stain`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
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
