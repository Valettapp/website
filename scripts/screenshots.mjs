// Full-page screenshots at 1440 and 390 px, plus per-section crops. Output: screenshots/
// Usage: node scripts/screenshots.mjs [--sections]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { serve } from './serve.mjs';

const port = 4399;
const server = await serve('dist', port);
mkdirSync('screenshots', { recursive: true });
const browser = await chromium.launch();
const sections = process.argv.includes('--sections');

for (const [name, width, height, dsf] of [['1440', 1440, 900, 1], ['390', 390, 844, 2]]) {
  // Static captures: emulate reduced motion so reveal/scroll animations render their final state.
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dsf, isMobile: width < 500, hasTouch: width < 500, reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Let lazy images below the fold load by scrolling through.
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `screenshots/full-${name}.png`, fullPage: true });
  await page.screenshot({ path: `screenshots/fold-${name}.png` });
  if (sections) {
    await page.addStyleTag({ content: 'body > header { visibility: hidden }' });
    const ids = await page.$$eval('main > section[id]', (els) => els.map((e) => e.id));
    for (const id of ids) {
      const el = await page.$(`#${id}`);
      if (el) await el.screenshot({ path: `screenshots/${id}-${name}.png` });
    }
  }
  await page.close();
}
await browser.close();
server.close();
console.log('screenshots written to screenshots/');
