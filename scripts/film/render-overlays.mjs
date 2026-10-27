// Renders the film's overlay assets from the built site: phone panels (real UI), captions, end card.
import { chromium } from '/home/user/website/node_modules/playwright/index.mjs';
import { serve } from '/home/user/website/scripts/serve.mjs';
import { readFileSync } from 'node:fs';
const OUT = process.argv[2] ?? 'film-work/overlays';
import { mkdirSync } from 'node:fs'; mkdirSync(OUT, { recursive: true });
const port = 4420; const server = await serve('dist', port);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '.phone-frame{background:rgba(255,255,255,.92)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}' });

// Guest phone states (reduced motion renders state 5; drive the stepper explicitly)
const guest = page.locator('#guest [data-guest]');
await guest.scrollIntoViewIfNeeded();
for (const n of [1, 3, 4, 5]) {
  await guest.locator(`[data-dot="${n}"]`).click(); await page.waitForTimeout(250);
  await guest.locator('.phone-frame').screenshot({ path: `${OUT}/guest-${n}.png`, omitBackground: true });
}
// Staff: ticket screen and the scan (final frame under reduced motion = results; replay to catch "scanning")
const staff = page.locator('#staff');
await staff.scrollIntoViewIfNeeded();
const ticket = staff.locator('.phone-frame').filter({ hasText: 'V777' }).first();
await ticket.screenshot({ path: `${OUT}/staff-ticket.png`, omitBackground: true });
const scanFrame = page.locator('[data-scan]').first().locator('xpath=ancestor::*[contains(@class,"phone-frame")][1]');
await scanFrame.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
await scanFrame.screenshot({ path: `${OUT}/staff-scan-results.png`, omitBackground: true });
await page.locator('[data-scan]').first().evaluate((el) => { el.dataset.phase = '1'; }); await page.waitForTimeout(200);
await scanFrame.screenshot({ path: `${OUT}/staff-scanning.png`, omitBackground: true });

// Captions and end card from a small page that uses the site's CSS
const css = readFileSync('dist/index.html', 'utf8').match(/<link rel="stylesheet" href="([^"]+)">/g).map((l) => l.match(/href="([^"]+)"/)[1]);
const caps = {
  c1: 'The evening starts at the kerb.',
  c3: 'One photo reads the plate, make and colour.',
  c4: 'The ticket is on the guest’s phone. Nothing to download.',
  c7: 'Request from the table.',
  c8: 'Pay and tip. By text.',
  c9: 'A text when it is at the door.',
  c10: 'Car and guest arrive together.',
};
const capPage = await browser.newPage({ viewport: { width: 1920, height: 200 }, deviceScaleFactor: 1 });
for (const [k, text] of Object.entries(caps)) {
  await capPage.setContent(`<!doctype html><html><head>${css.map((h) => `<link rel="stylesheet" href="http://127.0.0.1:${port}${h}">`).join('')}
    <style>html,body{margin:0;background:transparent}.cap{position:absolute;left:0;top:0;width:1920px;height:200px;display:flex;align-items:flex-end;padding:0 96px 56px;box-sizing:border-box;font-family:'Geist Variable',Geist,Inter,sans-serif;font-weight:500;font-size:44px;letter-spacing:-0.02em;color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.45)}</style></head>
    <body><div class="cap">${text}</div></body></html>`, { waitUntil: 'networkidle' });
  await capPage.evaluate(() => document.fonts.ready);
  await capPage.screenshot({ path: `${OUT}/${k}.png`, omitBackground: true });
}
// End card 1920x1080
const endPage = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await endPage.setContent(`<!doctype html><html><head>${css.map((h) => `<link rel="stylesheet" href="http://127.0.0.1:${port}${h}">`).join('')}
  <style>html,body{margin:0;background:#0a0a0a;height:100%}.end{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;color:#fff}
  .wm{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:112px;letter-spacing:.3em;text-indent:.3em}
  .slogan{font-family:'Geist Variable',Geist,Inter,sans-serif;font-weight:400;font-size:34px;letter-spacing:-0.01em;color:rgba(255,255,255,.72)}</style></head>
  <body><div class="end"><div class="wm">VALETT</div><div class="slogan">A new era for a timeless service.</div></div></body></html>`, { waitUntil: 'networkidle' });
await endPage.evaluate(() => document.fonts.ready);
await endPage.screenshot({ path: `${OUT}/end-card.png` });
// Portrait end card 1080x1920
await endPage.setViewportSize({ width: 1080, height: 1920 });
await endPage.addStyleTag({ content: '.wm{font-size:84px}.slogan{font-size:28px;text-align:center;padding:0 60px}' });
await endPage.screenshot({ path: `${OUT}/end-card-portrait.png` });
await browser.close(); server.close();
console.log('overlays rendered');
