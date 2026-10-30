// Frame-exact capture of the guest page's Apple Pay sequence at 30 fps (for media/applepay). Usage: node scripts/film/applepay-capture.mjs OUTDIR
import { chromium } from 'playwright';
import { serve } from '../serve.mjs';
import { mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const server = await serve('dist', 4397);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 1100 }, deviceScaleFactor: 3 });
await p.clock.install();
await p.goto('http://127.0.0.1:4397/', { waitUntil: 'load' });
await p.clock.pauseAt((await p.evaluate(() => Date.now())) + 1000);
await p.addStyleTag({ content: 'body > header{display:none!important} #guest .phone-screen{aspect-ratio:416/1000!important} #guest .phone-frame{width:359px!important;max-width:none!important;zoom:1!important}' });
const g = p.locator('#guest [data-guest]'); await g.scrollIntoViewIfNeeded();
await p.clock.runFor(1500);
await g.locator('[data-dot="4"]').click(); await p.clock.runFor(1000);
await g.locator('[data-tip="80"]').click(); await p.clock.runFor(500);
const FPS = 30, HOLD = 1.0, PAY = 5.65, TAIL = 2.6;
let vt = 0, n = 0;
await p.evaluate(() => { window.__st = new Map(); });
const step = () => p.evaluate((vt) => {
  const scr = document.querySelector('#guest .phone-screen');
  for (const a of scr.getAnimations({ subtree: true })) {
    if (!(a.timeline instanceof DocumentTimeline)) continue;
    if (!window.__st.has(a)) window.__st.set(a, vt);
    a.pause(); a.currentTime = Math.max(0, vt - window.__st.get(a));
  }
}, vt);
const shot = async () => { await step(); await g.locator('.phone-screen').screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png`, animations: 'allow' }); };
const total = Math.round((HOLD + PAY + TAIL) * FPS);
for (let i = 0; i < total; i++) {
  if (i === Math.round(HOLD * FPS)) await g.getByRole('button', { name: /Pay with Apple Pay/ }).click();
  await shot();
  await p.clock.runFor(1000 / FPS); vt += 1000 / FPS;
}
await b.close(); server.close(); console.log('frames', n);
