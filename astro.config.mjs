import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thehonestreviewers.com',
  integrations: [react(), tailwind(), sitemap()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
