// Generates icon PNGs (sharp) and the poster placeholder + OG image (Chromium via Playwright,
// so the Cormorant Garamond wordmark renders with the real webfont).
import sharp from 'sharp';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = resolve(root, 'public');
const assets = resolve(root, 'src/assets');
mkdirSync(assets, { recursive: true });

// --- Icons from favicon.svg -------------------------------------------------
const svg = readFileSync(resolve(pub, 'favicon.svg'));
await sharp(svg).resize(180, 180).png().toFile(resolve(pub, 'apple-touch-icon.png'));
await sharp(svg).resize(512, 512).png().toFile(resolve(pub, 'icon-512.png'));
await sharp(svg).resize(192, 192).png().toFile(resolve(pub, 'icon-192.png'));
// .ico: a 32px PNG is accepted by all modern browsers under the .ico name.
await sharp(svg).resize(32, 32).png().toFile(resolve(pub, 'favicon.ico'));

// --- Poster + OG via Chromium -----------------------------------------------
const fontDir = resolve(root, 'node_modules/@fontsource/cormorant-garamond/files');
const interDir = resolve(root, 'node_modules/@fontsource-variable/geist/files');
const serif = readFileSync(resolve(fontDir, 'cormorant-garamond-latin-400-normal.woff2')).toString('base64');
const inter = readFileSync(resolve(interDir, 'geist-latin-wght-normal.woff2')).toString('base64');

const page_ = (body, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:CG;src:url(data:font/woff2;base64,${serif}) format('woff2');}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter}) format('woff2');font-weight:100 900;}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#F2F2F0;}
.wm{font-family:CG;letter-spacing:.3em;text-transform:uppercase;color:#0A0A0A;margin-right:-.3em;}
.logo{font-family:Inter;font-weight:800;letter-spacing:-.04em;line-height:1;}
.slogan{font-family:Inter;font-weight:600;letter-spacing:-.035em;line-height:1.1;}
.wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px}
.eyebrow{font-family:Inter;font-weight:500;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#666}
.h1{font-family:Inter;font-weight:500;font-size:88px;letter-spacing:-.03em;color:#0A0A0A;line-height:1}
</style></head><body>${body}</body></html>`;

const browser = await chromium.launch();
async function shot(html, w, h, out) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png' });
  await page.close();
  writeFileSync(out, buf);
}

// Poster placeholder = the film's end card: black, gold logo, slogan.
const endCard = (wm, slogan) => `<div class="wrap" style="background:#0A0A0A;gap:${Math.round(wm*0.35)}px"><div class="wm" style="font-size:${wm}px;color:#fff">Valett</div><div class="slogan" style="font-size:${slogan}px;color:rgba(255,255,255,.72)">A new era for a timeless service.</div></div>`;
await shot(page_(endCard(112, 34), 1600, 900), 1600, 900, resolve(assets, 'poster-placeholder.png'));
await shot(page_(endCard(80, 28), 900, 1600), 900, 1600, resolve(assets, 'poster-placeholder-portrait.png'));
await shot(
  page_(
    `<div class="wrap" style="background:#fff;gap:30px"><div class="wm" style="font-size:112px">Valett</div><div class="slogan" style="font-size:44px;color:#0A0A0A;font-weight:500">A new era for a timeless service.</div><div class="eyebrow" style="margin-top:10px">Valet management for Dubai’s best venues</div></div>`,
    1200,
    630,
  ),
  1200,
  630,
  resolve(pub, 'og.png'),
);
await browser.close();
console.log('assets written');
