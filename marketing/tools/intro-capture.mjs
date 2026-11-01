// A 1.5 s VALETT opening for a reel ("Meet Valett." is spoken over it), drawn over the reel's own first frame
// so the cut into the reel is seamless. Themes: dark (ad 2: black with a gold glow and rings) or field (tutorial).
// Usage (repo root, after npm run build): node marketing/tools/intro-capture.mjs <dark|field> <first-frame.png> <outdir>
import { chromium } from 'playwright';
import { serve } from '../../scripts/serve.mjs';
import { mkdirSync, readFileSync } from 'node:fs';

const [THEME, BG, OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const FPS = 30, TOTAL = 1.5;
const bg = 'data:image/png;base64,' + readFileSync(BG).toString('base64');
const PORT = 4395 + (THEME === 'dark' ? 0 : 1);
const server = await serve('dist', PORT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
await page.evaluate(async ({ bg, THEME }) => {
  const dark = THEME === 'dark';
  const st = document.createElement('style');
  st.textContent = `
    body > *:not(#intro) { display: none !important; }
    html, body { overflow: hidden !important; margin: 0; }
    #intro { position: fixed; inset: 0; width: 1080px; height: 1920px; overflow: hidden; background: url(${bg}) 0 0 / 1080px 1920px; }
    #cover { position: absolute; inset: 0; background: ${dark ? '#030303' : '#f2f2f0'}; }
    #glow { position: absolute; inset: 0; background: radial-gradient(60% 42% at 50% 52%, rgba(197,162,83,.34), rgba(197,162,83,.08) 55%, rgba(0,0,0,0) 80%); display: ${dark ? 'block' : 'none'}; }
    #rings { position: absolute; left: 540px; top: 960px; }
    #rings i { position: absolute; border-radius: 50%; border: 30px solid ${dark ? 'rgba(197,162,83,.13)' : 'rgba(197,162,83,.12)'}; }
    #wm { position: absolute; left: 0; right: 0; top: 880px; text-align: center; font-family: var(--font-serif); font-size: 150px; letter-spacing: .3em; padding-inline-start: .3em;
      color: ${dark ? '#fff' : '#0a0a0a'}; ${dark ? 'text-shadow: 0 0 40px rgba(197,162,83,.7);' : ''} }
    #wm span { display: inline-block; }`;
  document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'intro';
  el.innerHTML = `<div id="cover"><div id="glow"></div><div id="rings">${'<i></i>'.repeat(6)}</div><div id="wm">${'VALETT'.split('').map((c) => `<span>${c}</span>`).join('')}</div></div>`;
  document.body.appendChild(el);
  await document.fonts.ready;
  const cl = (x) => Math.min(1, Math.max(0, x)), seg = (t, a, b) => cl((t - a) / (b - a)), eo = (k) => 1 - Math.pow(1 - k, 3);
  window.__r = (t) => {
    const out = seg(t, 1.15, 1.5);
    document.getElementById('cover').style.opacity = (1 - out).toFixed(3);
    document.querySelectorAll('#rings i').forEach((r, i) => { const p = (t * 0.25 + i / 6) % 1; const d = 300 + p * 1700;
      r.style.width = r.style.height = d + 'px'; r.style.left = r.style.top = (-d / 2) + 'px'; r.style.opacity = (1 - p).toFixed(3); });
    document.querySelectorAll('#wm span').forEach((s, i) => { const k = eo(seg(t, 0.05 + i * 0.07, 0.6 + i * 0.07));
      s.style.opacity = k.toFixed(3); s.style.transform = `translateY(${((1 - k) * 40).toFixed(1)}px)`; s.style.filter = `blur(${((1 - k) * 10 + out * 8).toFixed(1)}px)`; });
  };
}, { bg, THEME });
for (let i = 0; i < Math.round(TOTAL * FPS); i++) {
  await page.evaluate((t) => window.__r(t), i / FPS);
  await page.screenshot({ path: `${OUT}/f${String(i).padStart(4, '0')}.png` });
}
await browser.close(); server.close();
console.log('intro frames', Math.round(TOTAL * FPS));
