// Every interactive control, tried with a mouse and with touch, on desktop and phone sizes.
// Usage: node scripts/test-input.mjs  (expects dist/ built)
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const port = 4396;
const server = await serve('dist', port);
const browser = await chromium.launch();
let failures = 0;
const modes = [
  { name: 'desktop · mouse', vp: { width: 1440, height: 900 }, touch: false },
  { name: 'desktop · touchscreen', vp: { width: 1366, height: 768 }, touch: true },
  { name: 'phone · touch', vp: { width: 390, height: 844 }, touch: true, mobile: true },
  { name: 'phone width · mouse', vp: { width: 390, height: 844 }, touch: false },
];
for (const m of modes) {
  const ctx = await browser.newContext({ viewport: m.vp, hasTouch: m.touch, isMobile: !!m.mobile });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.log('  pageerror', e.message); failures++; });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  const out = [];
  const ok = (cond, label) => { out.push(`${cond ? '✓' : '✗'} ${label}`); if (!cond) failures++; };
  const press = async (loc) => { await loc.scrollIntoViewIfNeeded(); if (m.touch) await loc.tap(); else await loc.click(); };
  const narrow = m.vp.width < 1024;

  // Guest phone demo
  const g = page.locator('#guest [data-guest]');
  const state = () => g.locator('[data-state]:not([hidden])').getAttribute('data-state');
  await press(g.getByRole('button', { name: 'Request My Car' })); ok((await state()) === '2', 'guest: Request My Car');
  await press(g.locator('[data-dot="4"]')); ok((await state()) === '4', 'guest: stepper dot');
  await press(g.locator('[data-tip="40"]')); ok((await g.locator('[data-tip="40"]').getAttribute('data-on')) !== null, 'guest: tip 40');
  await press(g.getByRole('button', { name: /Pay with Apple Pay/ })); await page.waitForTimeout(300); ok(await g.locator('[data-applepay]').isVisible(), 'guest: Apple Pay');
  await press(g.locator('[data-reset]')); ok((await state()) === '1', 'guest: reset');
  // Scan replay
  const scan = page.locator('#staff [data-scan]').first();
  await press(scan.locator('[data-replay]')); ok((await scan.getAttribute('data-phase')) === '0', 'staff: tap the camera to replay');
  // Cursor: buttons look clickable to a mouse
  ok((await g.getByRole('button', { name: 'Request My Car' }).evaluate((e) => getComputedStyle(e).cursor)) === 'pointer', 'cursor: pointer on buttons');
  if (narrow) {
    // Savings rows and team bios
    const t = page.locator('#money .ledger-toggle').first(); await press(t); ok((await t.getAttribute('aria-expanded')) === 'true', 'savings: See how');
    const bt = page.locator('.bio-toggle').first(); await press(bt); await page.waitForTimeout(700); ok((await bt.getAttribute('aria-expanded')) === 'true', 'team: Read more');
    // Swipe rows: finger swipe or mouse drag
    const row = page.locator('#back-office .snap-row'); await row.scrollIntoViewIfNeeded();
    const s0 = await row.evaluate((e) => e.scrollLeft);
    const box = await row.boundingBox();
    if (m.touch) {
      // A finger: raw touch events (Chromium's synthetic scroll gesture does not move anything headless).
      const cdp = await ctx.newCDPSession(page); const x = box.x + box.width * 0.7, y = box.y + 60;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 25, y }] }); await page.waitForTimeout(16); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(box.x + box.width * 0.7, box.y + 80); await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + 80, { steps: 8 }); await page.mouse.up();
    }
    await page.waitForTimeout(700);
    ok((await row.evaluate((e) => e.scrollLeft)) > s0 + 50, `back office row: ${m.touch ? 'swipe' : 'mouse drag'}`);
    // Mobile menu
    const tog = page.locator('header [aria-controls]').first();
    await page.evaluate(() => scrollTo(0, 0)); await press(tog); await page.waitForTimeout(500);
    ok((await tog.getAttribute('aria-expanded')) === 'true', 'menu: opens');
    const link = page.locator('[data-menu-link]').first(); await press(link); await page.waitForTimeout(600);
    ok((await tog.getAttribute('aria-expanded')) === 'false', 'menu: a link closes it');
  }
  // Demo form
  const form = page.locator('[data-demo-form]'); await press(form.getByRole('button', { name: 'Book a demo' }));
  ok(((await form.locator('[data-form-status]').textContent()) || '').includes('Please fill in'), 'form: submit checks the fields');
  console.log(`\n${m.name}\n  ${out.join('\n  ')}`);
  await ctx.close();
}
await browser.close(); server.close();
console.log(failures ? `\n${failures} failure(s)` : '\nall input checks passed');
process.exit(failures ? 1 : 0);
