// Valett ad 2 (9:16, 1080x1920, 30 fps, ~33.5 s): "Verb The Noun" beats on black with a warm gold glow,
// a 3D-swaying iPhone running the real app (captured live from the built site), motion-trail titles, pulsing
// gold rings, glossy 3D icon tiles and a 3D hand that taps the real buttons. Logo end card.
// Assets in marketing/ad2/ (hand.png, icon-*.png, made with Higgsfield). Voice lines in marketing/voiceover/ad2/.
// Usage (repo root, after npm run build): node marketing/tools/ad2-capture.mjs <outdir>   (STRIDE=30 for a preview)
import { chromium } from 'playwright';
import { serve } from '../../scripts/serve.mjs';
import { mkdirSync, readFileSync } from 'node:fs';

const OUT = process.argv[2] || 'marketing/raw/ad2';
mkdirSync(OUT, { recursive: true });
const FPS = 30, TOTAL = 33.6, STRIDE = Number(process.env.STRIDE || 1);
const img = (f) => 'data:image/png;base64,' + readFileSync(`marketing/ad2/${f}`).toString('base64');
const ASSETS = { hand: img('hand.png'), car: img('icon-car.png'), key: img('icon-key.png'), camera: img('icon-camera.png'), pin: img('icon-pin.png') };
const PORT = 4392;
const server = await serve('dist', PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.clock.install();
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
await page.evaluate(() => document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }));
await page.waitForLoadState('networkidle');
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.decode() : new Promise((r) => { i.onload = r; i.onerror = r; })).catch(() => {}))));

await page.evaluate((A) => {
  const css = `
    body > *:not(#ad) { display: none !important; }
    html, body { overflow: hidden !important; background: #000 !important; }
    #ad { position: fixed; inset: 0; width: 1080px; height: 1920px; overflow: hidden; background: #030303; color: #fff; font-family: var(--font-sans); }
    #ad > * { position: absolute; }
    #glow { inset: 0; background: radial-gradient(60% 42% at 50% 52%, rgba(197,162,83,.34), rgba(197,162,83,.08) 55%, rgba(0,0,0,0) 80%); }
    #vig { inset: 0; background: radial-gradient(90% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.7)); z-index: 40; pointer-events: none; }
    #rings { left: 540px; top: 1060px; width: 0; height: 0; z-index: 2; }
    #rings i { position: absolute; left: 0; top: 0; border-radius: 50%; border: 34px solid rgba(197,162,83,.22); }
    .title { left: 0; right: 0; top: 230px; text-align: center; z-index: 30; white-space: nowrap; }
    .title span { position: absolute; left: 0; right: 0; font-size: 104px; font-weight: 700; letter-spacing: -0.04em;
      text-shadow: 0 0 34px rgba(197,162,83,.55), 0 0 4px rgba(255,255,255,.4); }
    .title b { color: #e2c47a; font-weight: 700; }
    #world { inset: 0; perspective: 2200px; perspective-origin: 50% 50%; z-index: 10; }
    .ph { position: absolute; left: 0; top: 0; transform-origin: 50% 50%; transform-style: preserve-3d; }
    .tile { width: 250px; z-index: 20; filter: drop-shadow(0 30px 40px rgba(0,0,0,.6)); }
    #hand { width: 330px; z-index: 35; filter: drop-shadow(0 30px 30px rgba(0,0,0,.55)); transform-origin: 70% 0; }
    #ripple { width: 140px; height: 140px; margin: -70px 0 0 -70px; border-radius: 50%; border: 6px solid rgba(226,196,122,.9); z-index: 34; opacity: 0; }
    #banner { left: 22px; right: 22px; top: 62px; padding: 16px 18px; border-radius: 22px; background: rgba(250,250,248,.9); color: #0a0a0a;
      backdrop-filter: blur(18px); box-shadow: 0 18px 40px -12px rgba(0,0,0,.45), inset 0 0 0 1px rgba(0,0,0,.06); z-index: 50; }
    #banner .k { display: flex; align-items: center; gap: 9px; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #777; font-weight: 600; }
    #banner .k span { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 7px; background: #0a0a0a; color: #fff; font-family: var(--font-serif); font-size: 15px; letter-spacing: 0; }
    #banner .m { margin-top: 7px; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
    #banner .s { margin-top: 2px; font-size: 13px; color: #555; }
    #end { inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #030303; }
    #end .wm { font-family: var(--font-serif); font-size: 140px; letter-spacing: .3em; margin-inline-start: .3em; color: #fff; text-shadow: 0 0 40px rgba(197,162,83,.7); }
    #end .tag { margin-top: 34px; font-size: 52px; font-weight: 600; letter-spacing: -0.02em; }
    #end .url { margin-top: 60px; font-size: 34px; color: #e2c47a; letter-spacing: .14em; }
    #endRings { position: absolute; left: 540px; top: 960px; width: 0; height: 0; }
    #endRings i { position: absolute; border-radius: 50%; border: 30px solid rgba(197,162,83,.13); }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  // [id, html, in, out, mode] mode: 'slide' (motion trail from the right) or 'type' (word by word)
  const TITLES = [
    ['t1', 'Snap The <b>Car</b>', 0.25, 6.3, 'slide'],
    ['t2', 'Send The <b>Ticket</b>', 6.75, 12.6, 'slide'],
    ['t3', 'Call The <b>Car</b>', 12.9, 17.6, 'slide'],
    ['t4', 'Follow The <b>Driver</b>', 17.9, 22.5, 'type'],
    ['t5', 'Tip The <b>Driver</b>', 22.7, 29.5, 'slide'],
  ];
  const ad = document.createElement('div'); ad.id = 'ad';
  ad.innerHTML = `
    <div id="glow"></div>
    <div id="rings">${'<i></i>'.repeat(6)}</div>
    <div id="world"><div class="ph" id="pScan"></div><div class="ph" id="pGuest"></div></div>
    ${TITLES.map(([id, h, , , mode]) => `<div class="title" id="${id}">${mode === 'slide' ? '<span class="g3">' + h + '</span><span class="g2">' + h + '</span><span class="g1">' + h + '</span>' : ''}<span class="main">${mode === 'type' ? h.split(' ').map((w) => `<em style="font-style:normal;display:inline-block">${w}</em>`).join(' ') : h}</span></div>`).join('')}
    <img class="tile" id="iCamera" src="${A.camera}"><img class="tile" id="iKey" src="${A.key}"><img class="tile" id="iCar" src="${A.car}"><img class="tile" id="iPin" src="${A.pin}">
    <div id="ripple"></div><img id="hand" src="${A.hand}">
    <div id="vig"></div>
    <div id="end"><div id="endRings">${'<i></i>'.repeat(6)}</div><div class="wm">VALETT</div><div class="tag">Valet, without the wait.</div><div class="url">VALETT.SI</div></div>`;
  document.body.appendChild(ad);

  const scan = document.querySelector('#staff [data-scan]').closest('.phone-device');
  scan.style.width = '330px'; scan.style.maxWidth = 'none';
  document.getElementById('pScan').appendChild(scan);
  const guest = document.querySelector('#guest [data-guest]');
  guest.querySelectorAll(':scope > div:not(.phone-device)').forEach((d) => { d.style.display = 'none'; });
  guest.style.width = '360px';
  const gWrap = document.getElementById('pGuest'); gWrap.appendChild(guest);
  const gDev = guest.querySelector('.phone-device'); gDev.style.position = 'relative';
  const banner = document.createElement('div'); banner.id = 'banner'; banner.style.position = 'absolute';
  banner.innerHTML = '<div class="k"><span>V</span>Valett · now</div><div class="m">Your ticket V777 is ready</div><div class="s">Land Rover Defender · tap to open</div>';
  gDev.appendChild(banner);

  const $ = (id) => document.getElementById(id);
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const back = (k, s = 1.5) => (k <= 0 ? 0 : 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2));
  // phone pose: centre x, top y, scale, rotateY, rotateX, blur, opacity
  const pose = (el, cx, top, s, ry, rx, blur, op) => {
    const w = el.firstElementChild.offsetWidth;
    el.style.transform = `translate(${(cx - w / 2).toFixed(1)}px,${top.toFixed(1)}px) scale(${s.toFixed(4)}) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    el.style.transformOrigin = `50% 0`;
    el.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
    el.style.opacity = op.toFixed(3); el.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
  };
  const tile = (id, x, y, a, b, from) => { // float in from a side, bob, leave
    const el = $(id); const k = back(seg(window.__t, a, a + 0.8), 1.2), o = eio(seg(window.__t, b, b + 0.5)); const t = window.__t;
    const on = k > 0 && o < 1; el.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
    const dx = (1 - cl(k)) * from * 500 + o * from * 300, bob = 14 * Math.sin(t * 1.6 + x);
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.style.transform = `translate(${dx.toFixed(1)}px,${bob.toFixed(1)}px) rotate(${(from * (1 - cl(k)) * 30 + 6 * Math.sin(t * 1.1 + y)).toFixed(2)}deg) scale(${(0.6 + 0.4 * k).toFixed(3)})`;
    el.style.opacity = (cl(k * 1.5) * (1 - o)).toFixed(3);
    el.style.filter = `drop-shadow(0 30px 40px rgba(0,0,0,.6)) blur(${((1 - cl(k)) * 10 + o * 12).toFixed(1)}px)`;
  };
  let hand = { from: null, to: null, a: -9, press: -9, out: -9 };
  window.__ad = {
    scan() { scan.querySelector('[data-replay]')?.click(); },
    dot(n) { guest.querySelector(`[data-dot="${n}"]`)?.click(); },
    tap(sel, travel = 0.7) { // hand travels to the button, presses, clicks
      const r = guest.querySelector(sel).getBoundingClientRect();
      const to = [r.left + r.width / 2, r.top + r.height / 2];
      const t = window.__t; const cur = window.__handPos;
      hand = { from: cur && t < hand.out ? cur : [to[0] + 160, 2100], to, a: t, press: t + travel, out: t + travel + 0.9 };
      setTimeout(() => guest.querySelector(sel).click(), (travel + 0.12) * 1000);
    },
    handOut(t) { hand.out = t; },
    render(t) {
      window.__t = t;
      // background glow breathes
      $('glow').style.opacity = (0.8 + 0.2 * Math.sin(t * 0.9)).toFixed(3);
      // titles
      TITLES.forEach(([id, , a, b, mode]) => {
        const el = $(id); const on = t > a && t < b + 0.6; el.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
        const o = eio(seg(t, b, b + 0.45));
        if (mode === 'slide') {
          const k = eo(seg(t, a, a + 0.75)), v = 1 - k; // velocity proxy for the trail
          const x = v * 700;
          const m = el.querySelector('.main'); m.style.transform = `translateX(${x.toFixed(1)}px) translateY(${(-o * 40).toFixed(1)}px)`;
          m.style.opacity = (cl(k * 2) * (1 - o)).toFixed(3); m.style.filter = `blur(${(v * 8 + o * 12).toFixed(1)}px)`;
          ['g1', 'g2', 'g3'].forEach((g, i) => { const s = el.querySelector('.' + g);
            s.style.transform = `translateX(${(x + v * 160 * (i + 1)).toFixed(1)}px)`; s.style.opacity = (v * 0.5 / (i + 1) * (1 - o)).toFixed(3); s.style.filter = 'blur(6px)'; });
        } else {
          const m = el.querySelector('.main'); m.style.opacity = (1 - o).toFixed(3); m.style.transform = `translateY(${(-o * 40).toFixed(1)}px)`;
          m.querySelectorAll('em').forEach((w, i) => { const k = eo(seg(t, a + i * 0.32, a + i * 0.32 + 0.35)); w.style.opacity = k.toFixed(3); w.style.transform = `translateY(${((1 - k) * 30).toFixed(1)}px)`; w.style.filter = `blur(${((1 - k) * 10).toFixed(1)}px)`; });
        }
      });
      // scan phone: swings in from the right with blur, whips out at 6.4
      const sIn = eo(seg(t, 0.1, 1.3)), sOut = eio(seg(t, 6.3, 6.85));
      pose($('pScan'), lerp(1500, 540, sIn) - sOut * 200, 470, 1.62, lerp(-55, -8, sIn) + 5 * Math.sin(t * 0.7) * sIn + sOut * 80, 6, (1 - sIn) * 18 + sOut * 24, sIn * (1 - sOut));
      // guest phone: whips in at 6.6, gentle sway, final exit at 29.6
      const gIn = eo(seg(t, 6.6, 7.6)), gOut = eio(seg(t, 29.5, 30.0));
      pose($('pGuest'), 540, 450 + gOut * 150, 1.5 * (1 - 0.15 * gOut), lerp(-80, 0, gIn) + 6 * Math.sin(t * 0.55) * gIn, 4 + 2 * Math.sin(t * 0.4), (1 - gIn) * 22 + gOut * 20, t < 6.6 ? 0 : gIn * (1 - gOut));
      // banner drops onto the guest screen (Send The Ticket)
      const bIn = back(seg(t, 7.7, 8.25), 1.2), bOut = eio(seg(t, 11.8, 12.2));
      banner.style.opacity = (cl(bIn * 2) * (1 - bOut)).toFixed(3);
      banner.style.transform = `translateY(${((1 - bIn) * -120 - bOut * 60).toFixed(1)}px) scale(${(0.9 + 0.1 * cl(bIn)).toFixed(3)})`;
      banner.style.filter = `blur(${((1 - cl(bIn)) * 6 + bOut * 8).toFixed(1)}px)`;
      // gold rings pulse outward (Follow The Driver) and behind the end card
      const rOn = seg(t, 17.8, 18.4) * (1 - seg(t, 22.4, 23.0));
      $('rings').querySelectorAll('i').forEach((r, i) => { const p = ((t * 0.32 + i / 6) % 1); const d = 420 + p * 1500;
        r.style.width = r.style.height = d + 'px'; r.style.left = r.style.top = (-d / 2) + 'px'; r.style.opacity = (rOn * (1 - p)).toFixed(3); });
      // icon tiles
      tile('iCamera', 30, 1290, 1.4, 6.2, -1);
      tile('iKey', 800, 1180, 8.6, 12.4, 1);
      tile('iCar', 20, 1250, 18.6, 22.4, -1);
      tile('iPin', 810, 820, 19.1, 22.4, 1);
      // hand
      const H = $('hand'); const hw = 330, hh = 330 * 894 / 513, tipX = 0.702 * hw, tipY = 0.01 * hh;
      let hp = null, ho = 0, press = 0;
      if (hand.to && t >= hand.a) {
        const k = eio(seg(t, hand.a, hand.press)); const o = eio(seg(t, hand.out, hand.out + 0.6));
        hp = [lerp(hand.from[0], hand.to[0], k) + o * 120, lerp(hand.from[1], hand.to[1], k) + o * 900];
        press = Math.sin(Math.PI * seg(t, hand.press, hand.press + 0.28)); ho = o < 1 ? 1 : 0;
      }
      window.__handPos = hp;
      if (hp && ho) {
        H.style.visibility = 'visible';
        H.style.transform = `translate(${(hp[0] - tipX).toFixed(1)}px,${(hp[1] - tipY + press * 10).toFixed(1)}px) rotate(-8deg) scale(${(1 - 0.08 * press).toFixed(3)})`;
      } else H.style.visibility = 'hidden';
      const rk = hand.to ? seg(t, hand.press, hand.press + 0.6) : 0;
      $('ripple').style.left = (hand.to ? hand.to[0] : 0) + 'px'; $('ripple').style.top = (hand.to ? hand.to[1] : 0) + 'px';
      $('ripple').style.opacity = (rk > 0 && rk < 1 ? 1 - rk : 0).toFixed(3); $('ripple').style.transform = `scale(${lerp(.4, 1.6, rk).toFixed(3)})`;
      // end card
      const e = eio(seg(t, 29.45, 30.0));
      $('end').style.opacity = e.toFixed(3); $('end').style.visibility = e > 0 ? 'visible' : 'hidden';
      $('endRings').querySelectorAll('i').forEach((r, i) => { const p = ((t * 0.25 + i / 6) % 1); const d = 300 + p * 1700;
        r.style.width = r.style.height = d + 'px'; r.style.left = r.style.top = (-d / 2) + 'px'; r.style.opacity = (1 - p).toFixed(3); });
      [...$('end').children].slice(1).forEach((c, i) => { const k = eo(seg(t, 30.0 + i * 0.35, 30.9 + i * 0.35)); c.style.opacity = k.toFixed(3);
        c.style.transform = `translateY(${((1 - k) * 30).toFixed(1)}px)`; c.style.filter = `blur(${((1 - k) * 10).toFixed(1)}px)`; });
    },
  };
}, ASSETS);

const cues = [
  [0.4, `__ad.scan()`],
  [13.7, `__ad.tap('[data-go="2"]', 0.75)`],
  [15.3, `__ad.tap('[data-state="2"] [data-go="3"]', 0.6)`],
  [17.9, `__ad.dot(4)`],
  [22.9, `__ad.tap('[data-tip="80"]', 0.7)`],
  [23.9, `__ad.tap('[data-pay]', 0.55)`],
];
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
  await page.evaluate((t) => { window.__t = t; }, t);
  while (ci < cues.length && cues[ci][0] <= t) { await page.evaluate(cues[ci][1]); ci++; }
  await page.evaluate((t) => window.__ad.render(t), t);
  await step();
  if (i % STRIDE === 0) await page.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png`, animations: 'allow' });
  await page.clock.runFor(1000 / FPS); vt += 1000 / FPS;
}
await browser.close(); server.close();
console.log('frames', n);
