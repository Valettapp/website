// Drives the interactive samples headlessly and asserts their states.
// Usage: node scripts/test-interactions.mjs  (expects dist/ built)
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { mkdirSync } from 'node:fs';

const port = 4398;
const server = await serve('dist', port);
const browser = await chromium.launch();
mkdirSync('screenshots/states', { recursive: true });
let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failures++; };

// --- Guest phone: five states ----------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => { console.log('pageerror', e.message); failures++; });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  const guest = page.locator('[data-guest]');
  await guest.scrollIntoViewIfNeeded();
  const visible = async () => guest.locator('[data-state]:not([hidden])').getAttribute('data-state');
  check((await visible()) === '1', 'guest starts at state 1 (Parked)');
  await guest.getByRole('button', { name: 'Request My Car' }).click();
  check((await visible()) === '2', 'Request My Car → state 2 (sheet)');
  await page.waitForTimeout(400); await guest.locator('.phone-screen').screenshot({ path: 'screenshots/states/guest-2.png' });
  await guest.getByRole('button', { name: 'Text me when it’s ready' }).click();
  check((await visible()) === '3', 'Text me → state 3 (Request received)');
  await page.waitForTimeout(400); await guest.locator('.phone-screen').screenshot({ path: 'screenshots/states/guest-3.png' });
  await page.waitForTimeout(2700);
  check((await visible()) === '4', 'auto-advance → state 4 after 2.4 s');
  await guest.locator('[data-tip="40"]').click();
  await page.waitForTimeout(400); await guest.locator('.phone-screen').screenshot({ path: 'screenshots/states/guest-4.png' });
  await guest.getByRole('button', { name: /Pay with Apple Pay/ }).click();
  check((await visible()) === '5', 'Apple Pay → state 5 (All done)');
  check((await guest.locator('[data-tip-out]').textContent()) === '40', 'tip selection carried to receipt');
  await page.waitForTimeout(400); await guest.locator('.phone-screen').screenshot({ path: 'screenshots/states/guest-5.png' });
  await guest.locator('[data-reset]').click();
  check((await visible()) === '1', 'Reset → state 1');
  await guest.locator('[data-dot="4"]').click();
  check((await visible()) === '4', 'stepper dot jumps to state 4');
  await guest.locator('[data-prev]').click();
  check((await visible()) === '3', 'prev arrow → state 3');

  // --- Key board: overdue + toast ----------------------------------------
  const kb = page.locator('[data-keyboard]');
  await kb.scrollIntoViewIfNeeded();
  await kb.locator('[data-reset]').click();
  await page.waitForTimeout(500);
  check(!(await kb.locator('[data-row="V772"]').getAttribute('data-late')), 'V772 not late at start');
  await page.waitForTimeout(6500);
  check((await kb.locator('[data-row="V772"]').getAttribute('data-late')) !== null, 'V772 turns gold after passing its target (~6 s)');
  check((await kb.locator('[data-toast]').getAttribute('data-on')) !== null, 'Shift manager pinged toast shown');
  await kb.screenshot({ path: 'screenshots/states/keyboard-late.png' });

  // --- Scan animation phases ---------------------------------------------
  const scan = page.locator('[data-scan]').first();
  await scan.scrollIntoViewIfNeeded();
  await scan.locator('[data-replay]').click();
  check((await scan.getAttribute('data-phase')) === '0', 'scan phase 0 (viewfinder) after replay');
  await page.waitForTimeout(1800);
  check((await scan.getAttribute('data-phase')) === '1', 'scan phase 1 (scanning)');
  await page.waitForTimeout(1800);
  check((await scan.getAttribute('data-phase')) === '2', 'scan phase 2 (results)');
  await page.waitForTimeout(900);
  await scan.screenshot({ path: 'screenshots/states/scan-results.png' });

  // --- Form validation ---------------------------------------------------
  const form = page.locator('[data-demo-form]');
  await form.scrollIntoViewIfNeeded();
  await form.getByRole('button', { name: 'Book a demo' }).click();
  const status = await form.locator('[data-form-status]').textContent();
  check(status.includes('Please fill in'), 'empty form shows validation message');
  await page.close();
}

// --- Reduced motion: final states render first ----------------------------
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  const guest = page.locator('[data-guest]');
  await guest.scrollIntoViewIfNeeded();
  check((await guest.locator('[data-state]:not([hidden])').getAttribute('data-state')) === '5', 'reduced motion: guest renders final state (5)');
  const kb = page.locator('[data-keyboard]');
  await kb.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  check((await kb.locator('[data-row="V772"]').getAttribute('data-late')) !== null, 'reduced motion: key board renders end state');
  const scan = page.locator('[data-scan]').first();
  await scan.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  check((await scan.getAttribute('data-phase')) === '2', 'reduced motion: scan renders final frame');
  await ctx.close();
}

await browser.close();
server.close();
console.log(failures ? `\n${failures} failure(s)` : '\nall interaction checks passed');
process.exit(failures ? 1 : 0);
