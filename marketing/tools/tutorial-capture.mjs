// Tutorial reel ("How to get your car with Valett"), 1080x1920 at 30 fps, captured frame by frame from the
// real guest page on the built site: the page's own clock and CSS animations are stepped per frame.
// Usage (from the repo root, after npm run build): node marketing/tools/tutorial-capture.mjs <outdir>
import { chromium } from 'playwright';
import { serve } from '../../scripts/serve.mjs';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'marketing/raw/tutorial-frames';
mkdirSync(OUT, { recursive: true });
const FPS = 30;
const server = await serve('dist', 4371);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.clock.install();
await page.goto('http://127.0.0.1:4371/', { waitUntil: 'load' });
await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
await page.evaluate(() => document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }));
await page.waitForLoadState('networkidle');
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.decode() : new Promise((r) => { i.onload = r; i.onerror = r; })).catch(() => {}))));

// Build the reel stage: brand field, title, caption, the staff ticket phone (step 1) and the live guest phone.
await page.evaluate(() => {
  const css = `
    body > *:not(#reel) { display: none !important; }
    html, body { background: #f2f2f0 !important; overflow: hidden !important; }
    #reel { position: fixed; inset: 0; width: 1080px; height: 1920px; background: #f2f2f0; font-family: var(--font-sans); color: #0a0a0a; overflow: hidden; }
    #reel .glow { position: absolute; width: 900px; height: 900px; border-radius: 50%; filter: blur(120px); opacity: .55; }
    #reel .brand { position: absolute; top: 96px; left: 0; right: 0; text-align: center; font-family: var(--font-serif); font-size: 34px; letter-spacing: .32em; }
    #reel .kicker { position: absolute; top: 190px; left: 90px; right: 90px; text-align: center; font-size: 26px; letter-spacing: .16em; text-transform: uppercase; color: #826b37; font-weight: 500; }
    #reel .cap { position: absolute; top: 236px; left: 70px; right: 70px; height: 190px; text-align: center; }
    #reel .cap p { position: absolute; inset: 0; margin: 0; font-size: 64px; line-height: 1.06; font-weight: 600; letter-spacing: -0.03em; opacity: 0; transform: translateY(26px); transition: opacity .25s ease, transform .3s ease; text-wrap: balance; }
    #reel .cap p.on { opacity: 1; transform: none; transition: opacity .5s ease .3s, transform .7s cubic-bezier(.16,1,.3,1) .3s; }
    #reel .stage { position: absolute; left: 50%; top: 455px; width: 360px; transform-origin: 50% 0; scale: 1.72; translate: -50% 0; }
    #reel .stage > * { position: absolute; inset: 0 auto auto 0; width: 360px; transition: opacity .5s ease, translate .7s cubic-bezier(.16,1,.3,1); }
    #reel .staff { display: flex; justify-content: center; }
    #reel .staff > div { width: 330px !important; max-width: none !important; }
    #reel [data-guest] > .phone-device ~ div, #reel [data-guest] > div:not(.phone-device):last-child { display: none !important; }
    #reel .dots { position: absolute; bottom: 120px; left: 0; right: 0; display: flex; justify-content: center; gap: 14px; }
    #reel .dots i { width: 46px; height: 5px; border-radius: 3px; background: rgba(0,0,0,.12); transition: background .4s; }
    #reel .dots i.on { background: #c5a253; }
    #reel .url { position: absolute; bottom: 56px; left: 0; right: 0; text-align: center; font-size: 30px; color: #666; letter-spacing: .02em; }
    #reel .tap { position: absolute; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; background: rgba(10,10,10,.18); box-shadow: 0 0 0 4px rgba(10,10,10,.28); opacity: 0; pointer-events: none; z-index: 50; }
    #reel .tap.go { animation: tapgo .7s ease-out both; }
    @keyframes tapgo { 0% { opacity: 0; scale: .5; } 25% { opacity: 1; scale: .8; } 100% { opacity: 0; scale: 1.5; } }
    #reel .end { position: absolute; inset: 0; background: #0a0a0a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 36px; opacity: 0; transition: opacity .6s ease; z-index: 60; }
    #reel .end.on { opacity: 1; }
    #reel .end .w { font-family: var(--font-serif); font-size: 96px; letter-spacing: .3em; margin-inline-start: .3em; }
    #reel .end .s { font-size: 46px; font-weight: 500; letter-spacing: -0.02em; }
    #reel .end .u { font-size: 32px; color: #c5a253; letter-spacing: .06em; }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const reel = document.createElement('div'); reel.id = 'reel';
  reel.innerHTML = `
    <div class="glow" style="left:-300px;top:300px;background:#fff"></div>
    <div class="glow" style="right:-360px;top:900px;background:#e9dcb8"></div>
    <div class="brand">VALETT</div>
    <div class="kicker" id="kicker">How to get your car</div>
    <div class="cap" id="cap"></div>
    <div class="stage" id="stage"><div class="staff" id="tstaff"></div></div>
    <div class="dots" id="dots">${'<i></i>'.repeat(7)}</div>
    <div class="url">valett.si</div>
    <div class="tap" id="tap"></div>
    <div class="end" id="end"><div class="w">VALETT</div><div class="u">valett.si</div></div>`;
  document.body.appendChild(reel);
  const ticket = [...document.querySelectorAll('#staff .phone-device')].find((p) => p.textContent.includes('V777') && p.textContent.includes('Park car'));
  document.getElementById('tstaff').appendChild(ticket.cloneNode(true));
  const guest = document.querySelector('#guest [data-guest]');
  guest.style.opacity = '0';
  document.getElementById('stage').appendChild(guest);
  const caps = ['Scan the QR on the valet’s phone.', 'Your ticket opens. Your car’s photo, no app.', 'Ready to leave? Tap Request My Car.', 'Leave your number for a text. No account.', 'Watch your driver bring it to the door.', 'Tip the driver with Apple Pay.', 'Safe travels. The receipt comes by text.'];
  document.getElementById('cap').innerHTML = caps.map((c, i) => `<p data-c="${i}"><span style="color:#c5a253">${i + 1}.</span> ${c}</p>`).join('');
  window.__reel = {
    step(i) {
      document.querySelectorAll('#cap p').forEach((p) => p.classList.toggle('on', Number(p.dataset.c) === i));
      document.querySelectorAll('#dots i').forEach((d, k) => d.classList.toggle('on', k <= i));
    },
    show(which) { document.getElementById('tstaff').style.opacity = which === 'staff' ? '1' : '0'; guest.style.opacity = which === 'guest' ? '1' : '0'; },
    tap(sel) {
      const el = guest.querySelector(sel); const r = el.getBoundingClientRect();
      const t = document.getElementById('tap'); t.style.left = `${r.left + r.width / 2}px`; t.style.top = `${r.top + r.height / 2}px`;
      t.classList.remove('go'); void t.offsetWidth; t.classList.add('go');
      setTimeout(() => el.click(), 180);
    },
    end() { document.getElementById('end').classList.add('on'); },
  };
});

// Timeline (seconds) on the page's own clock.
const cues = [
  [0.3, `__reel.step(0); __reel.show('staff')`],
  [3.4, `__reel.step(1); __reel.show('guest')`],
  [6.2, `__reel.step(2)`],
  [7.4, `__reel.tap('[data-go="2"]')`],
  [9.4, `__reel.step(3)`],
  [10.6, `__reel.tap('[data-go="3"]')`],
  [12.4, `__reel.step(4)`],
  [16.6, `__reel.step(5)`],
  [17.4, `__reel.tap('[data-tip="80"]')`],
  [18.6, `__reel.tap('[data-pay]')`],
  [24.6, `__reel.step(6)`],
  [27.8, `__reel.end()`],
];
const TOTAL = 30.5;
let vt = 0, n = 0, ci = 0;
await page.evaluate(() => { window.__st = new Map(); });
const step = () => page.evaluate((vt) => {
  for (const a of document.getAnimations()) {
    if (!(a.timeline instanceof DocumentTimeline)) continue;
    if (!window.__st.has(a)) window.__st.set(a, vt);
    a.pause(); a.currentTime = Math.max(0, vt - window.__st.get(a));
  }
}, vt);
const frames = Math.min(Math.round(TOTAL * FPS), Number(process.env.MAXF || 1e9));
for (let i = 0; i < frames; i++) {
  const t = i / FPS;
  while (ci < cues.length && cues[ci][0] <= t) { await page.evaluate(cues[ci][1]); ci++; }
  await step();
  await page.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png`, animations: 'allow' });
  await page.clock.runFor(1000 / FPS); vt += 1000 / FPS;
}
if (process.env.MAXF) console.log(await page.evaluate(() => { const s = document.querySelector('#staff'); const ph = s.querySelector('.phone-device'); const r = ph?.getBoundingClientRect(); const cs = ph && getComputedStyle(ph); return { staffOp: getComputedStyle(s).opacity, ph: !!ph, rect: r && [r.x, r.y, r.width, r.height].map(Math.round), op: cs?.opacity, vis: cs?.visibility, disp: cs?.display, parentOp: getComputedStyle(s.parentElement).opacity }; }));
await browser.close(); server.close();
console.log('frames', n);
