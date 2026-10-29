// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://valett.si',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: {
    // Cast: @tailwindcss/vite ships Vite 7 types while Astro 5 bundles Vite 6; runtime is compatible.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  build: {
    // Inline all CSS: removes the render-blocking stylesheet requests that delayed first paint on mobile.
    inlineStylesheets: 'always',
    // Flat files (hotel-valet-app.html) so hosts serve /hotel-valet-app without redirecting to a trailing slash;
    // canonical and sitemap URLs then match what is served.
    format: 'file',
  },
});
