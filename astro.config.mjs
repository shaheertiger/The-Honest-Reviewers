import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Buyer's guides that target high-volume search terms. They get a higher
// sitemap priority than the 0.5 default so crawlers reach them sooner.
const priorityGuides = new Set([
  'best-weed-killer',
  'best-pressure-washer',
  'best-electric-pressure-washer',
  'best-stud-finder',
  'best-electric-lawn-mower',
  'best-dehumidifier-for-basement',
  'best-garden-hose',
  'best-snow-blower',
  'best-leaf-blower',
  'best-cordless-leaf-blower',
  'best-string-trimmer',
  'best-shop-vac',
  'best-riding-lawn-mower',
  'best-battery-powered-lawn-mower',
  'best-push-mower',
  'best-portable-power-station',
  'best-grass-seed',
  'best-fertilizer-for-grass',
  'best-electric-snow-blower',
  'best-laser-level',
  'best-weed-eater',
  'best-torque-wrench',
  'best-expandable-garden-hose',
  'best-hose-reel',

  // August 2026 batch: water heaters, flooring, home systems and workshop tools.
  'best-tankless-water-heater',
  'best-gas-water-heater',
  'best-laminate-flooring',
  'best-vinyl-plank-flooring',
  'best-underlayment-for-vinyl-plank-flooring',
  'best-tile-leveling-system',
  'best-grout-sealer',
  'best-air-purifier-for-smoke',
  'best-whole-house-fan',
  'best-whole-house-surge-protector',
  'best-circuit-breaker-finder',
  'best-drain-snake',
  'best-belt-sander',
  'best-drywall-sander',
  'best-palm-sander',
  'best-telescoping-ladder',
  'best-attic-ladder',
  'best-jigsaw',
  'best-wood-router',
  'best-router-table',
  'best-drill-press',
  'best-benchtop-planer',
  'best-framing-hammer',
  'best-bench-vise',
  'best-wire-stripper',

  // August 2026 batch: generators, mowers, waterproofing and concrete coatings.
  'best-zero-turn-mower',
  'best-robotic-lawn-mower',
  'best-inverter-generator',
  'best-dual-fuel-inverter-generator',
  'best-dual-fuel-generator',
  'best-tri-fuel-generator',
  'best-natural-gas-generator',
  'best-whole-house-generator',
  'best-concrete-floor-coating',
  'best-exterior-wood-sealer',
  'driveway-resurfacing-cost',
  'waterproofing-basement-walls-from-outside',
  'how-to-get-oil-out-of-concrete',
  'leaf-filter-reviews',
  // August 2026 publishing batch: epoxy floor how-tos, generator sizing,
  // sealing troubleshooting, basement water and mower maintenance.
  'how-to-clean-epoxy-garage-floor',
  'how-to-seal-epoxy-garage-floor',
  'how-to-prepare-concrete-for-epoxy',
  'garage-floor-epoxy-drying-time',
  'what-size-generator-do-i-need-for-my-house',
  'rain-after-driveway-sealing',
  'deck-stain-drying-time',
  'why-paver-sealer-turns-white',
  'water-coming-through-basement-floor',
  'how-often-to-sharpen-mower-blades',

  // August 2026: home gym, garage fit-out and outdoor gear.
  'best-home-gym-equipment-on-a-budget',
  'best-crash-pad-for-bouldering-outdoors',
  'best-canoes-for-river-paddling',
  'best-harness-for-zipline-riding',
  'best-ski-gloves',

  // September 2026: the electric pressure washer supporting cluster.
  'electric-vs-gas-pressure-washer',
  'what-psi-pressure-washer-do-i-need',
  'pressure-washer-psi-vs-gpm',
  'induction-vs-universal-motor-pressure-washer',
  'cordless-vs-corded-pressure-washer',
  'pressure-washer-extension-cord-size',
  'pressure-washer-water-supply-requirements',
  'how-to-pressure-wash-a-car',
  'how-to-pressure-wash-vinyl-siding',
  'can-an-electric-pressure-washer-clean-concrete',
  'pressure-washer-nozzle-colors-explained',
  'what-not-to-pressure-wash',
  'how-to-use-detergent-in-a-pressure-washer',
  'how-to-winterize-a-pressure-washer',
  'pressure-washer-not-building-pressure',

  // September 2026: garage floor and epoxy gaps from keyword data.
  'epoxy-flooring',
  'garage-flooring-options',
  'garage-floor-coating-contractors',
]);

export default defineConfig({
  site: 'https://www.thehonestreviewers.com',
  // Canonical URLs, sitemap entries and internal links all use a trailing slash;
  // Vercel 308-redirects the slash-less form (see trailingSlash in vercel.json).
  trailingSlash: 'always',
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
        } else if (url === `${base}/best-chainsaw`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-cordless-drills`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-dishwasher`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-water-softener-system`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-water-filtration-system-for-home`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.7;
        } else if (url === `${base}/best-water-filter-pitcher`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/best-ceiling-fans-with-lights`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-air-purifier-for-home`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
        } else if (url === `${base}/best-cordless-drill-for-home-use`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.6;
        } else if (url === `${base}/generac-generator-cost`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/what-size-generator-do-i-need-for-my-house`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/how-to-prepare-concrete-for-epoxy`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (url === `${base}/water-coming-through-basement-floor`) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.9;
        } else if (priorityGuides.has(url.slice(base.length + 1))) {
          item.changefreq = 'monthly';
          item.lastmod = new Date().toISOString();
          item.priority = 0.8;
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
