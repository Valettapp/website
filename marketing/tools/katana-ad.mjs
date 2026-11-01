// Valett full-screen ad (9:16, 1080x1920, 30 fps, ~42 s), v2 of the Katana piece.
// Kinetic type and flat motion around the real app: the staff scan, the staff ticket and the live guest page
// (Request My Car, tracker, Apple Pay with Face ID, Safe travels), all from the built site and stepped frame by frame.
// Usage (repo root, after npm run build): node marketing/tools/katana-ad.mjs <outdir>   (MAXF=n for a short test)
import { chromium } from 'playwright';
import { serve } from '../../scripts/serve.mjs';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'marketing/raw/katana-v2';
mkdirSync(OUT, { recursive: true });
const FPS = 30, TOTAL = 42.5;
const START = Number(process.env.START || 0); // seconds to skip (for previews)
const STRIDE = Number(process.env.STRIDE || 1);
const PORT = 4391;
const server = await serve('dist', PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.clock.install();
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
await page.evaluate(() => document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }));
await page.waitForLoadState('networkidle');
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.decode() : new Promise((r) => { i.onload = r; i.onerror = r; })).catch(() => {}))));

await page.evaluate(() => {
  const css = `
    body > *:not(#ad) { display: none !important; }
    html, body { overflow: hidden !important; background: #fff !important; }
    #ad { position: fixed; inset: 0; width: 1080px; height: 1920px; overflow: hidden; background: #fff; color: #0a0a0a; font-family: var(--font-sans); }
    #ad > * { position: absolute; }
    #ad .head { left: 70px; right: 70px; top: 170px; text-align: center; z-index: 30; }
    #ad .hl { display: block; overflow: hidden; padding: 6px 0 14px; margin-bottom: -14px; font-size: 108px; line-height: 1; font-weight: 600; letter-spacing: -0.05em; white-space: nowrap; }
    #ad .hl b { font-weight: 600; color: #c5a253; }
    #ad .w { display: inline-block; will-change: transform; }
    #ad .ph { left: 0; top: 0; transform-origin: 0 0; z-index: 10; }
    #ad .chips { left: 0; right: 0; display: flex; justify-content: center; gap: 18px; z-index: 30; }
    #ad .chip { padding: 20px 34px; border-radius: 999px; font-size: 36px; font-weight: 500; letter-spacing: -0.01em; white-space: nowrap;
      background: #fff; color: #0a0a0a; box-shadow: inset 0 0 0 2px rgba(0,0,0,.1), 0 20px 40px -24px rgba(0,0,0,.35); }
    #ad .chip.gold { box-shadow: inset 0 0 0 2px #c5a253, 0 20px 40px -24px rgba(0,0,0,.35); }
    #ad .chip.dark { background: rgba(255,255,255,.08); color: #fff; box-shadow: inset 0 0 0 2px #c5a253; }
    #ad .chip i { font-style: normal; color: #c5a253; margin-inline-end: 12px; }
    #ad .tap { width: 150px; height: 150px; margin: -75px 0 0 -75px; border-radius: 50%; background: rgba(10,10,10,.14); box-shadow: 0 0 0 5px rgba(10,10,10,.22); z-index: 50; opacity: 0; }
    #ad .disc { left: 540px; top: 960px; width: 2400px; height: 2400px; margin: -1200px 0 0 -1200px; border-radius: 50%; background: #0a0a0a; z-index: 5; }
    #ad .panel { left: 0; right: 0; top: 0; height: 1920px; z-index: 6; }
    #ad .timer { left: 0; right: 0; top: 760px; text-align: center; font-size: 300px; font-weight: 600; letter-spacing: -0.06em; font-variant-numeric: tabular-nums; z-index: 20; }
    #ad .wbar { left: 190px; width: 700px; top: 1120px; height: 10px; border-radius: 5px; background: rgba(0,0,0,.08); overflow: hidden; z-index: 20; }
    #ad .wbar i { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; background: #0a0a0a; transform-origin: 0 50%; }
    #ad .heat { left: 0; right: 0; top: 1220px; display: flex; justify-content: center; z-index: 20; }
    #ad .brand { left: 0; right: 0; top: 820px; text-align: center; color: #fff; z-index: 20; }
    #ad .brand .wm { font-family: var(--font-serif); font-size: 150px; font-weight: 400; letter-spacing: .3em; margin-inline-start: .3em; }
    #ad .brand .wm span { display: inline-block; }
    #ad .brand .tag { margin-top: 40px; font-size: 52px; font-weight: 500; letter-spacing: -0.02em; }
    #ad .toast { left: 110px; right: 110px; top: 1560px; z-index: 30; padding: 30px 34px; border-radius: 30px; background: rgba(255,255,255,.82);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08), 0 30px 60px -30px rgba(0,0,0,.4); }
    #ad .toast .k { display: flex; align-items: center; gap: 14px; font-size: 24px; letter-spacing: .1em; text-transform: uppercase; color: #666; font-weight: 500; }
    #ad .toast .k span { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 11px; background: #0a0a0a; color: #fff; font-family: var(--font-serif); font-size: 26px; letter-spacing: 0; }
    #ad .toast .m { margin-top: 12px; font-size: 36px; font-weight: 600; letter-spacing: -0.02em; }
    #ad .end { inset: 0; z-index: 70; background: #0a0a0a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    #ad .end .wm { font-family: var(--font-serif); font-size: 128px; letter-spacing: .3em; margin-inline-start: .3em; }
    #ad .end .tag { margin-top: 36px; font-size: 54px; font-weight: 500; letter-spacing: -0.02em; }
    #ad .end .cta { margin-top: 90px; padding: 30px 64px; border-radius: 999px; background: #fff; color: #0a0a0a; font-size: 40px; font-weight: 600; letter-spacing: -0.01em; }
    #ad .end .url { margin-top: 40px; font-size: 34px; color: #c5a253; letter-spacing: .1em; }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const ad = document.createElement('div'); ad.id = 'ad';
  // Headlines: [id, lines (words; *word* = gold), in, out, dark?]
  const HEADS = [
    ['h1', ['Waiting for', 'your car?'], 0.25, 4.9, false],
    ['h3', ['One photo.', 'Every detail.'], 9.9, 15.2, true],
    ['h4', ['Your ticket.', 'On your *phone.*'], 15.7, 19.9, false],
    ['h5', ['Ready to go?', 'Tap *once.*'], 20.3, 25.8, false],
    ['h6', ['Watch it come', 'to the *door.*'], 26.0, 29.4, false],
    ['h7', ['Tip in', '*two* taps.'], 29.7, 35.4, false],
    ['h8', ['Safe', '*travels.*'], 35.6, 38.4, false],
  ];
  const heads = HEADS.map(([id, lines, a, b, dark]) => {
    const html = lines.map((l) => `<span class="hl">${l.split(' ').map((w) => {
      const g = /^\*(.*)\*$/.exec(w); return `<span class="w">${g ? `<b>${g[1]}</b>` : w}</span>`;
    }).join(' ')}</span>`).join('');
    return `<div class="head" id="${id}" style="color:${dark ? '#fff' : '#0a0a0a'}">${html}</div>`;
  }).join('');
  ad.innerHTML = `
    <div class="disc" id="disc"></div>
    <div class="panel" id="white" style="background:#fff"></div>
    <div class="timer" id="timer">00:00</div>
    <div class="wbar" id="wbar"><i id="wfill"></i></div>
    <div class="heat" id="heat"><span class="chip gold" style="font-size:44px"><i>●</i>40°C outside</span></div>
    <div class="brand" id="brand"><div class="wm">${'VALETT'.split('').map((c) => `<span>${c}</span>`).join('')}</div><div class="tag" id="btag" style="display:none"></div></div>
    ${heads}
    <div class="ph" id="pScan"></div><div class="ph" id="pTicket"></div><div class="ph" id="pGuest"></div>
    <div class="chips" id="c3" style="top:1720px">${['Plate', 'Make', 'Model', 'Colour'].map((c) => `<span class="chip dark">${c}</span>`).join('')}</div>
    <div class="chips" id="c4" style="top:1700px">${['No app', 'No paper', 'No account'].map((c) => `<span class="chip gold">${c}</span>`).join('')}</div>
    <div class="toast" id="toast"><div class="k"><span>V</span>Messages · now</div><div class="m">Your Land Rover is on its way. 4 min.</div></div>
    <div class="tap" id="tap"></div>
    <div class="end" id="end"><div class="wm">VALETT</div><div class="cta">Book a demo</div><div class="url">VALETT.SI</div></div>`;
  document.body.appendChild(ad);

  // Real components
  const scan = document.querySelector('#staff [data-scan]').closest('.phone-device');
  scan.style.width = '330px'; scan.style.maxWidth = 'none';
  document.getElementById('pScan').appendChild(scan);
  const ticket = [...document.querySelectorAll('#staff .phone-device')].find((p) => p.textContent.includes('V777') && p.textContent.includes('Park car'));
  const tk = ticket.cloneNode(true); tk.style.width = '330px'; tk.style.maxWidth = 'none';
  document.getElementById('pTicket').appendChild(tk);
  const guest = document.querySelector('#guest [data-guest]');
  guest.querySelectorAll(':scope > div:not(.phone-device)').forEach((d) => { d.style.display = 'none'; });
  guest.style.width = '360px';
  document.getElementById('pGuest').appendChild(guest);

  const $ = (id) => document.getElementById(id);
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const back = (k, s = 1.4) => (k <= 0 ? 0 : 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2));
  const W = (el) => el.firstElementChild.offsetWidth, H = (el) => el.firstElementChild.offsetHeight;
  const place = (el, cx, top, s, op = 1, rot = 0) => {
    el.style.transform = `translate(${(cx - W(el) * s / 2).toFixed(1)}px,${top.toFixed(1)}px) scale(${s.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
    el.style.opacity = op.toFixed(3); el.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
  };
  let tapAt = -9, tapX = 0, tapY = 0;

  window.__ad = {
    tap(sel) {
      const el = guest.querySelector(sel); const r = el.getBoundingClientRect();
      tapX = r.left + r.width / 2; tapY = r.top + r.height / 2; tapAt = window.__t;
      setTimeout(() => el.click(), 200);
    },
    scan() { scan.querySelector('[data-replay]')?.click(); },
    dot(n) { guest.querySelector(`[data-dot="${n}"]`)?.click(); },
    render(t) {
      window.__t = t;
      // headlines: words rise out of a mask, staggered; leave upward
      HEADS.forEach(([id, , a, b]) => {
        const el = $(id); const on = t > a - 0.05 && t < b + 0.6; el.style.visibility = on ? 'visible' : 'hidden';
        if (!on) return;
        el.querySelectorAll('.w').forEach((w, i) => {
          const k = eo(seg(t, a + i * 0.09, a + i * 0.09 + 0.7)), o = eio(seg(t, b + i * 0.04, b + i * 0.04 + 0.45));
          w.style.transform = `translateY(${((1 - k) * 115 - o * 115).toFixed(1)}%)`;
        });
      });
      // A: hook timer 0 -> 30:00, heat chip
      const tm = Math.round(eio(seg(t, 0.6, 3.4)) * 1800);
      $('timer').textContent = `${String(Math.floor(tm / 60)).padStart(2, '0')}:${String(tm % 60).padStart(2, '0')}`;
      const tIn = eo(seg(t, 0.2, 0.8)), tOut = eio(seg(t, 4.7, 5.25));
      $('timer').style.opacity = (tIn * (1 - tOut)).toFixed(3);
      $('timer').style.transform = `translateY(${lerp(60, 0, tIn).toFixed(1)}px) scale(${(1 - 0.5 * tOut).toFixed(3)})`;
      $('timer').style.color = t > 3.4 ? '#c5a253' : '#0a0a0a';
      $('wbar').style.opacity = (tIn * (1 - tOut)).toFixed(3);
      $('wfill').style.transform = `scaleX(${eio(seg(t, 0.6, 3.4)).toFixed(4)})`; $('wfill').style.background = t > 3.4 ? '#c5a253' : '#0a0a0a';
      const hk = back(seg(t, 2.6, 3.1)), hOut = seg(t, 4.6, 4.9);
      $('heat').style.opacity = (cl(hk) * (1 - hOut)).toFixed(3); $('heat').style.transform = `scale(${(0.6 + 0.4 * hk).toFixed(3)})`;
      // B: black disc grows from the timer; wordmark letters; tagline
      const dIn = eio(seg(t, 4.85, 5.6));
      $('disc').style.transform = `scale(${dIn.toFixed(4)})`;
      $('disc').style.visibility = dIn > 0 ? 'visible' : 'hidden';
      const bOut = eio(seg(t, 9.0, 9.5));
      $('brand').style.visibility = t > 5.2 && t < 9.6 ? 'visible' : 'hidden';
      $('brand').querySelectorAll('.wm span').forEach((s, i) => {
        const k = eo(seg(t, 5.45 + i * 0.08, 6.25 + i * 0.08));
        s.style.opacity = (k * (1 - bOut)).toFixed(3); s.style.transform = `translateY(${((1 - k) * 50 - bOut * 60).toFixed(1)}px)`;
      });
      const tg = eo(seg(t, 6.75, 7.4));
      $('btag').style.opacity = (tg * (1 - bOut)).toFixed(3); $('btag').style.transform = `translateY(${((1 - tg) * 24).toFixed(1)}px)`;
      // white panel wipes up from the bottom at 15.3 (dark scan scene -> light)
      const wp = eio(seg(t, 15.2, 15.85));
      $('white').style.transform = `translateY(${t < 4.9 ? 0 : ((1 - wp) * 1920).toFixed(1)}px)`;
      $('white').style.visibility = t < 4.9 || wp > 0 ? 'visible' : 'hidden';
      // C: scan phone rises in on black
      const sIn = eo(seg(t, 9.2, 10.2)), sOut = eio(seg(t, 15.0, 15.6));
      place($('pScan'), 540, lerp(1950, 560, sIn) - sOut * 300, 1.42, sIn * (1 - sOut));
      $('c3').querySelectorAll('.chip').forEach((c, i) => {
        const k = back(seg(t, [11.5, 12.75, 13.5, 14.1][i], [11.5, 12.75, 13.5, 14.1][i] + 0.45)), o = seg(t, 15.0, 15.3);
        c.style.opacity = (cl(k * 2) * (1 - o)).toFixed(3); c.style.transform = `scale(${(0.5 + 0.5 * k).toFixed(3)})`;
      });
      // D: ticket phone from the left, guest phone from the right
      const kIn = eo(seg(t, 15.7, 16.7)), gIn = back(seg(t, 16.6, 17.6), 1.1), kOut = eio(seg(t, 20.0, 20.8));
      place($('pTicket'), lerp(-300, 290, kIn) - kOut * 700, 640, 1.18, kIn, lerp(-6, -2, kIn));
      // guest: in from right (D), to centre and larger (E onwards), small hold drift
      const toC = eio(seg(t, 20.0, 21.0));
      const gx = lerp(lerp(1400, 790, gIn), 540, toC), gs = lerp(1.18, 1.52, toC), gTop = lerp(640, 540, toC), gr = lerp(lerp(8, 2, cl(gIn)), 0, toC);
      const gEnd = eio(seg(t, 38.3, 38.9));
      place($('pGuest'), gx, gTop + 1.2 * Math.sin(t * 0.8) * toC + gEnd * 200, gs, t < 16.55 ? 0 : 1 - gEnd, gr);
      $('c4').querySelectorAll('.chip').forEach((c, i) => {
        const a = [17.4, 18.0, 18.6][i], k = back(seg(t, a, a + 0.45)), o = seg(t, 19.9, 20.3);
        c.style.opacity = (cl(k * 2) * (1 - o)).toFixed(3); c.style.transform = `scale(${(0.5 + 0.5 * k).toFixed(3)})`;
      });
      // F: SMS toast
      const nIn = eo(seg(t, 27.2, 27.8)), nOut = eio(seg(t, 29.3, 29.8));
      $('toast').style.opacity = (nIn * (1 - nOut)).toFixed(3);
      $('toast').style.transform = `translateY(${((1 - nIn) * 80 + nOut * 40).toFixed(1)}px)`;
      // tap ripple
      const tk2 = seg(t, tapAt, tapAt + 0.75);
      $('tap').style.left = tapX + 'px'; $('tap').style.top = tapY + 'px';
      $('tap').style.opacity = (tk2 > 0 && tk2 < 1 ? (tk2 < .25 ? tk2 / .25 : 1 - (tk2 - .25) / .75) : 0).toFixed(3);
      $('tap').style.transform = `scale(${lerp(.5, 1.55, tk2).toFixed(3)})`;
      // I: end card
      const e = eio(seg(t, 38.5, 39.1));
      $('end').style.opacity = e.toFixed(3);
      $('end').style.visibility = e > 0 ? 'visible' : 'hidden';
      [...$('end').children].forEach((c, i) => { const k = eo(seg(t, 38.8 + i * 0.3, 39.6 + i * 0.3)); c.style.opacity = k.toFixed(3); c.style.transform = `translateY(${((1 - k) * 30).toFixed(1)}px)`; });
    },
  };
});

const cues = [
  [9.3, `__ad.scan()`],
  [22.5, `__ad.tap('[data-go="2"]')`],
  [24.1, `__ad.tap('[data-state="2"] [data-go="3"]')`],
  [26.0, `__ad.dot(4)`],
  [30.7, `__ad.tap('[data-tip="80"]')`],
  [31.5, `__ad.tap('[data-pay]')`],
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
  while (ci < cues.length && cues[ci][0] <= t) { await page.evaluate(cues[ci][1]); ci++; }
  await page.evaluate((t) => window.__ad.render(t), t);
  if (t >= START && i % STRIDE === 0) {
    await step();
    await page.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png`, animations: 'allow' });
  }
  await page.clock.runFor(1000 / FPS); vt += 1000 / FPS;
}
await browser.close(); server.close();
console.log('frames', n);
