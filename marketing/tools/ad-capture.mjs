// Apple-style product ads (9:16, 1080x1920, 30 fps) built only from the real Valett interface on the built site:
// the components are lifted into a 3D stage, a virtual camera glides over them, captions fade in, and every frame is
// captured with the page's clock and CSS animations stepped exactly. No AI imagery.
// Usage (repo root, after npm run build): node marketing/tools/ad-capture.mjs <scene> <outdir>
//   scenes: tap | photo | board | tip
import { chromium } from 'playwright';
import { serve } from '../../scripts/serve.mjs';
import { mkdirSync } from 'node:fs';

const SCENE = process.argv[2];
const OUT = process.argv[3] || `marketing/raw/ad-${SCENE}`;
mkdirSync(OUT, { recursive: true });
const FPS = 30;

const BASE_CSS = `
  body > *:not(#ad) { display: none !important; }
  html, body { overflow: hidden !important; background: var(--ad-bg) !important; }
  #ad { --ad-bg: #f5f5f3; --ad-ink: #0a0a0a; --ad-sub: #6b6b6b; position: fixed; inset: 0; width: 1080px; height: 1920px; overflow: hidden;
    background: var(--ad-bg); color: var(--ad-ink); font-family: var(--font-sans); }
  #ad.dark { --ad-bg: #050505; --ad-ink: #fff; --ad-sub: rgba(255,255,255,.55); }
  #ad .glow { position: absolute; border-radius: 50%; filter: blur(140px); pointer-events: none; }
  #ad .head { position: absolute; top: 210px; left: 80px; right: 80px; text-align: center; z-index: 20; }
  #ad .line { display: block; font-size: 92px; line-height: 1.02; font-weight: 600; letter-spacing: -0.045em; opacity: 0; filter: blur(14px); transform: translateY(24px);
    transition: opacity .9s ease, filter .9s ease, transform 1.1s cubic-bezier(.16,1,.3,1); }
  #ad .line.sub { font-size: 40px; font-weight: 450; letter-spacing: -0.01em; color: var(--ad-sub); margin-top: 26px; }
  #ad .line.on { opacity: 1; filter: none; transform: none; }
  #ad .line.off { opacity: 0; filter: blur(14px); transform: translateY(-20px); }
  #ad .world { position: absolute; inset: 0; perspective: 2200px; perspective-origin: 50% 45%; }
  #ad .cam { position: absolute; left: 50%; top: 50%; width: 0; height: 0; transform-style: preserve-3d; }
  #ad .obj { position: absolute; transform-style: preserve-3d; }
  #ad .tap { position: absolute; width: 130px; height: 130px; margin: -65px 0 0 -65px; border-radius: 50%; background: rgba(10,10,10,.16); box-shadow: 0 0 0 4px rgba(10,10,10,.24); opacity: 0; z-index: 40; pointer-events: none; }
  #ad.dark .tap { background: rgba(255,255,255,.2); box-shadow: 0 0 0 4px rgba(255,255,255,.35); }
  #ad .tap.go { animation: adtap .75s ease-out both; }
  @keyframes adtap { 0% { opacity: 0; scale: .5; } 25% { opacity: 1; scale: .8; } 100% { opacity: 0; scale: 1.55; } }
  #ad .end { position: absolute; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px;
    background: var(--ad-bg); opacity: 0; transition: opacity .8s ease; }
  #ad .end.on { opacity: 1; }
  #ad .end .w { font-family: var(--font-serif); font-size: 104px; letter-spacing: .3em; margin-inline-start: .3em; opacity: 0; transform: translateY(16px); transition: opacity 1s ease .25s, transform 1.2s cubic-bezier(.16,1,.3,1) .25s; }
  #ad .end .s { font-size: 46px; font-weight: 500; letter-spacing: -0.02em; opacity: 0; transition: opacity 1s ease .8s; }
  #ad .end .u { font-size: 32px; color: #c5a253; letter-spacing: .08em; opacity: 0; transition: opacity 1s ease 1.3s; }
  #ad .end.on .w, #ad .end.on .s, #ad .end.on .u { opacity: 1; transform: none; }
  /* Glass icon bar (the app's steps), pieces appear one by one */
  #ad .bar { display: flex; gap: 22px; padding: 22px 26px; border-radius: 999px; background: rgba(255,255,255,.62); backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4); box-shadow: 0 1px 2px rgba(0,0,0,.05), inset 0 0 0 1px rgba(0,0,0,.06), 0 40px 80px -40px rgba(0,0,0,.25); }
  #ad.dark .bar { background: rgba(255,255,255,.08); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), 0 40px 80px -40px rgba(0,0,0,.8); }
  #ad .bar i { display: grid; place-items: center; width: 96px; height: 96px; border-radius: 50%; background: #fff; color: #0a0a0a; font-style: normal; opacity: 0; scale: .6;
    transition: opacity .5s ease, scale .7s cubic-bezier(.34,1.56,.64,1); box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
  #ad.dark .bar i { background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
  #ad .bar i.on { opacity: 1; scale: 1; }
  #ad .bar i.gold { color: #c5a253; }
  #ad .bar svg { width: 44px; height: 44px; }
`;

// Simple outline icons (camera, ticket/QR, car, Apple Pay-style tap)
const ICON = {
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2"/><circle cx="8" cy="13" r="1"/><circle cx="16" cy="13" r="1"/></svg>',
  pay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M9 12.5l2 2 4-5"/></svg>',
  board: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M13 5v14"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/></svg>',
};

// Each scene: dark?, setup (runs in the page, gets helpers), cues [[t, js]], total seconds.
const SCENES = {
  tap: {
    dark: false, total: 14.5,
    setup: `
      const g = document.querySelector('#guest [data-guest]');
      g.querySelectorAll(':scope > div:not(.phone-device)').forEach((d) => d.style.display = 'none');
      const ph = g; ph.style.width = '360px';
      A.obj(ph, 'phone');
      A.bar(['camera','qr','car','pay'], 'bar', 'gold:2');
      A.lines(['Your car.', 'One tap away.'], 'Request it from the table. Watch it come.');
      A.pose('phone', { x: 0, y: 700, z: -500, rx: 30, ry: -26, rz: 7, s: 1.5 }, 0);
      A.pose('bar', { x: 0, y: -40, z: 300, rx: 16, ry: -12, rz: 3, s: 1.7 }, 0);
      A.glow('#ffffff', -300, 300, 1100); A.glow('#ecdfbd', 520, 1180, 900);
    `,
    cues: [
      [0.2, `A.pose('phone', { x: 0, y: 470, z: -80, rx: 18, ry: -16, rz: 4, s: 1.5 }, 3.2)`],
      [0.5, `A.on('bar', 0)`], [0.9, `A.on('bar', 1)`], [1.3, `A.on('bar', 2)`], [1.7, `A.on('bar', 3)`],
      [2.6, `A.pose('bar', { x: 0, y: -380, z: -200, rx: 16, ry: -12, rz: 3, s: 1.2, o: 0 }, 1.2)`],
      [2.9, `A.line(0)`], [3.5, `A.line(1)`], [4.1, `A.line(2)`],
      [4.0, `A.pose('phone', { x: 0, y: 560, z: 60, rx: 6, ry: -6, rz: 1, s: 1.55 }, 2.6)`],
      [6.6, `A.tap('[data-go="2"]')`],
      [8.0, `A.tap('[data-go="3"]')`],
      [8.6, `A.pose('phone', { x: 0, y: 545, z: 30, rx: 4, ry: 8, rz: -1, s: 1.55 }, 4)`],
      [12.2, `A.end()`],
    ],
  },
  photo: {
    dark: true, total: 12.5,
    setup: `
      const p = document.querySelector('#staff [data-scan]').closest('.phone-device');
      p.style.width = '330px';
      A.obj(p, 'phone');
      A.lines(['One photo.', 'Plate. Make. Model. Colour.'], 'Read at the door, day and night.');
      A.pose('phone', { x: 0, y: 760, z: -600, rx: 34, ry: 24, rz: -8, s: 1.6 }, 0);
      A.glow('#3a3020', -260, 700, 1000); A.glow('#1d1d1f', 500, 1300, 900);
      A.replayScan();
    `,
    cues: [
      [0.2, `A.pose('phone', { x: 0, y: 540, z: 0, rx: 12, ry: 10, rz: -3, s: 1.6 }, 3.6)`],
      [1.0, `A.line(0)`], [1.8, `A.line(1)`], [2.6, `A.line(2)`],
      [0.3, `A.replayScan()`],
      [4.2, `A.pose('phone', { x: 0, y: 560, z: 80, rx: 3, ry: -4, rz: 1, s: 1.62 }, 5)`],
      [10.2, `A.end()`],
    ],
  },
  board: {
    dark: true, total: 13,
    setup: `
      const img = document.querySelector('#staff img[alt^="Key controller board"]');
      const card = document.createElement('div');
      card.style.cssText = 'width:1500px;border-radius:26px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 80px 160px -60px rgba(0,0,0,.9)';
      const im = document.createElement('img'); im.src = img.currentSrc || img.src; im.style.cssText = 'display:block;width:100%';
      card.appendChild(im); A.obj(card, 'board');
      // the "Requested" column lifted out and brought into focus
      // The "Requested" column, cut from the same screenshot, lifts out and comes into focus.
      const lift = document.createElement('canvas'); const k = img.naturalWidth / 1500;
      lift.width = Math.round(330 * k); lift.height = Math.round(520 * k);
      lift.getContext('2d').drawImage(img, 498 * k, 170 * k, 330 * k, 520 * k, 0, 0, lift.width, lift.height);
      lift.style.cssText = 'display:block;width:330px;height:520px;border-radius:18px;background:#fff;box-shadow:0 0 0 2px #c5a253,0 60px 120px -40px rgba(0,0,0,.9)';
      A.obj(lift, 'lift');
      A.lines(['Every car.', 'One board.'], 'Checked in to at the podium, live.');
      A.pose('board', { x: 0, y: 560, z: -1300, rx: 46, ry: 0, rz: 0, s: 1 }, 0);
      A.pose('lift', { x: 0, y: 560, z: -1300, rx: 46, ry: 0, rz: 0, s: 1, o: 0 }, 0);
      A.glow('#2b2416', -200, 900, 1200); A.glow('#141414', 600, 300, 900);
    `,
    cues: [
      [0.2, `A.pose('board', { x: 0, y: 420, z: -700, rx: 32, ry: -10, rz: 2, s: 1 }, 4)`],
      [1.0, `A.line(0)`], [1.7, `A.line(1)`], [2.5, `A.line(2)`],
      [4.4, `A.pose('board', { x: 240, y: 470, z: -1100, rx: 28, ry: -14, rz: 3, s: 1, blur: 10, o: .55 }, 2)`],
      [4.6, `A.pose('lift', { x: -260, y: 360, z: -900, rx: 28, ry: -14, rz: 3, s: 1, o: 1 }, 0.01)`],
      [4.7, `A.pose('lift', { x: 0, y: 520, z: 150, rx: 6, ry: -6, rz: 0, s: 1.3, o: 1 }, 2.2)`],
      [10.6, `A.end()`],
    ],
  },
  tip: {
    dark: false, total: 13.5,
    setup: `
      const g = document.querySelector('#guest [data-guest]');
      g.querySelectorAll(':scope > div:not(.phone-device)').forEach((d) => d.style.display = 'none');
      g.style.width = '360px';
      A.obj(g, 'phone');
      g.querySelector('[data-dot="4"]').click();
      A.lines(['Tip in two clicks.', ''], 'Apple Pay, Face ID, a receipt by text.');
      A.pose('phone', { x: 0, y: 760, z: -500, rx: 28, ry: 22, rz: -6, s: 1.5 }, 0);
      A.glow('#ffffff', 480, 300, 1100); A.glow('#ecdfbd', -480, 1300, 900);
    `,
    cues: [
      [0.2, `A.pose('phone', { x: 0, y: 560, z: 40, rx: 8, ry: 8, rz: -2, s: 1.55 }, 3.4)`],
      [1.0, `A.line(0)`], [2.0, `A.line(2)`],
      [3.6, `A.tap('[data-tip="80"]')`],
      [4.6, `A.tap('[data-pay]')`],
      [5.0, `A.pose('phone', { x: 0, y: 545, z: 60, rx: 2, ry: -4, rz: 0, s: 1.58 }, 5)`],
      [11.2, `A.end()`],
    ],
  },
};

const sc = SCENES[SCENE];
if (!sc) { console.error('scene?', Object.keys(SCENES)); process.exit(1); }
const PORT = 4360 + Object.keys(SCENES).indexOf(SCENE) + (Number(process.env.STRIDE || 1) > 1 ? 10 : 0);
const server = await serve('dist', PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.clock.install();
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
await page.evaluate(() => document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }));
await page.waitForLoadState('networkidle');
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.decode() : new Promise((r) => { i.onload = r; i.onerror = r; })).catch(() => {}))));
await page.evaluate(({ css, dark, icons }) => {
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const ad = document.createElement('div'); ad.id = 'ad'; if (dark) ad.classList.add('dark');
  ad.innerHTML = `<div class="world"><div class="cam" id="cam"></div></div><div class="head" id="head"></div><div class="tap" id="tap"></div>
    <div class="end" id="end"><div class="w">VALETT</div><div class="s">Valet, without the wait.</div><div class="u">valett.si</div></div>`;
  document.body.appendChild(ad);
  const objs = {};
  const set = (o, p) => {
    const t = `translate3d(${p.x || 0}px, ${p.y || 0}px, ${p.z || 0}px) rotateX(${p.rx || 0}deg) rotateY(${p.ry || 0}deg) rotateZ(${p.rz || 0}deg) scale(${p.s || 1}) translate(-50%, -50%)`;
    o.style.transform = t; o.style.opacity = p.o == null ? '1' : String(p.o); o.style.filter = p.blur ? `blur(${p.blur}px)` : 'none';
  };
  window.A = {
    obj(el, name) { const w = document.createElement('div'); w.className = 'obj'; w.appendChild(el); document.getElementById('cam').appendChild(w); objs[name] = w; return w; },
    pose(name, p, dur) { const o = objs[name]; o.style.transition = dur ? `transform ${dur}s cubic-bezier(.22,1,.36,1), opacity ${Math.min(dur, 1)}s ease, filter ${Math.min(dur, 1.2)}s ease` : 'none'; set(o, p); },
    bar(list, name, gold) { const b = document.createElement('div'); b.className = 'bar'; b.innerHTML = list.map((k, i) => `<i class="${gold === 'gold:' + i ? 'gold' : ''}">${icons[k]}</i>`).join(''); A.obj(b, name); },
    on(name, i) { objs[name].querySelectorAll('i')[i].classList.add('on'); },
    lines(main, sub) { document.getElementById('head').innerHTML = main.map((l) => `<span class="line">${l}</span>`).join('') + `<span class="line sub">${sub}</span>`; },
    line(i) { document.querySelectorAll('#head .line')[i]?.classList.add('on'); },
    glow(c, x, y, size) { const g = document.createElement('div'); g.className = 'glow'; g.style.cssText = `background:${c};left:${x}px;top:${y}px;width:${size}px;height:${size}px;opacity:${document.getElementById('ad').classList.contains('dark') ? .6 : .7}`; document.getElementById('ad').prepend(g); },
    tap(sel) {
      const el = document.querySelector('#ad ' + sel); const r = el.getBoundingClientRect();
      const t = document.getElementById('tap'); t.style.left = `${r.left + r.width / 2}px`; t.style.top = `${r.top + r.height / 2}px`;
      t.classList.remove('go'); void t.offsetWidth; t.classList.add('go'); setTimeout(() => el.click(), 200);
    },
    replayScan() { document.querySelector('#ad [data-replay]')?.click(); },
    end() { document.querySelectorAll('#head .line').forEach((l) => l.classList.add('off')); setTimeout(() => document.getElementById('end').classList.add('on'), 250); },
  };
}, { css: BASE_CSS, dark: sc.dark, icons: ICON });
await page.evaluate(sc.setup);

let vt = 0, n = 0, ci = 0;
const cues = sc.cues.slice().sort((a, b) => a[0] - b[0]);
await page.evaluate(() => { window.__st = new Map(); });
const step = () => page.evaluate((vt) => {
  for (const a of document.getAnimations()) {
    if (!(a.timeline instanceof DocumentTimeline)) continue;
    if (!window.__st.has(a)) window.__st.set(a, vt);
    a.pause(); a.currentTime = Math.max(0, vt - window.__st.get(a));
  }
}, vt);
const frames = Math.round(sc.total * FPS);
for (let i = 0; i < frames; i++) {
  const t = i / FPS;
  while (ci < cues.length && cues[ci][0] <= t) { await page.evaluate(cues[ci][1]); ci++; }
  await step();
  const STRIDE = Number(process.env.STRIDE || 1); // preview: keep every Nth frame
  if (i % STRIDE === 0) await page.screenshot({ path: `${OUT}/f${String(i).padStart(4, '0')}.png`, animations: 'allow' });
  n++;
  await page.clock.runFor(1000 / FPS); vt += 1000 / FPS;
}
await browser.close(); server.close();
console.log(SCENE, 'frames', n);
