// Lighthouse (mobile + desktop) against the built site. Output: lighthouse/*.html + summary.
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdirSync, writeFileSync } from 'node:fs';
import { serve } from './serve.mjs';

const port = 4397;
const server = await serve('dist', port);
mkdirSync('lighthouse', { recursive: true });
const chromePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
// Pages to audit: argv paths, default the home page. e.g. node scripts/lighthouse.mjs / /hotel-valet-app
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const cats = ['performance', 'accessibility', 'best-practices', 'seo'];
const summary = {};
for (const path of paths) for (const formFactor of ['mobile', 'desktop']) {
  const url = `http://127.0.0.1:${port}${path}`;
  const key = `${path} ${formFactor}`;
  const flags = { port: chrome.port, output: 'html', onlyCategories: cats, logLevel: 'error' };
  const config = formFactor === 'desktop'
    ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } }
    : undefined;
  const r = await lighthouse(url, flags, config);
  writeFileSync(`lighthouse/${(path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home')}-${formFactor}.html`, r.report);
  summary[key] = Object.fromEntries(cats.map((c) => [c, Math.round(r.lhr.categories[c].score * 100)]));
  const a = r.lhr.audits;
  summary[key].metrics = { LCP: a['largest-contentful-paint'].displayValue, CLS: a['cumulative-layout-shift'].displayValue, TBT: a['total-blocking-time'].displayValue, FCP: a['first-contentful-paint'].displayValue };
  const failing = Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode === 'binary' || (x.score !== null && x.score < 0.5)).map((x) => `${x.id}: ${x.displayValue ?? ''}`);
  summary[key].failing = failing;
}
await chrome.kill();
server.close();
console.log(JSON.stringify(summary, null, 2));
