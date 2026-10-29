// Crawls the built site (dist/) for broken internal links, missing assets, missing anchors and SEO basics.
// Usage: node scripts/check-links.mjs   (run after npm run build)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const DIST = 'dist';
const pages = readdirSync(DIST).filter((f) => f.endsWith('.html'));
const idsOf = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const resolve = (p) => {
  if (p === '/' || p === '') return 'index.html';
  const clean = p.replace(/^\//, '');
  if (existsSync(join(DIST, clean))) return clean;
  if (existsSync(join(DIST, clean + '.html'))) return clean + '.html';
  return null;
};
let problems = 0;
const report = (page, msg) => { problems++; console.log(`✗ ${page}: ${msg}`); };
const titles = new Map(), descs = new Map();
for (const page of pages) {
  const html = readFileSync(join(DIST, page), 'utf8');
  const ids = idsOf(html);
  const isError = page === '404.html';
  // SEO basics
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canon = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) report(page, 'no <title>'); else if (title.length > 70) report(page, `title ${title.length} chars (keep ≤ 70)`);
  if (!desc) report(page, 'no meta description'); else if (desc.length > 170) report(page, `description ${desc.length} chars (keep ≤ 170)`);
  if (!isError) {
    if (!canon) report(page, 'no canonical');
    if (h1s !== 1) report(page, `${h1s} <h1> elements`);
    if (title) { if (titles.has(title)) report(page, `duplicate title with ${titles.get(title)}`); titles.set(title, page); }
    if (desc) { if (descs.has(desc)) report(page, `duplicate description with ${descs.get(desc)}`); descs.set(desc, page); }
  }
  // Images need alt
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt(="|[\s>])/.test(m[0])) report(page, `img without alt: ${m[0].slice(0, 80)}`);
  // Links and assets
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])));
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    const [path, hash] = ref.split('#');
    if (path === '' && hash) { if (!ids.has(hash)) report(page, `missing anchor #${hash}`); continue; }
    const target = resolve(path.split('?')[0]);
    if (!target) { report(page, `broken link ${ref}`); continue; }
    if (hash && target.endsWith('.html')) {
      const tids = idsOf(readFileSync(join(DIST, target), 'utf8'));
      if (!tids.has(hash)) report(page, `missing anchor ${ref}`);
    }
  }
}
console.log(problems ? `\n${problems} problem(s) across ${pages.length} pages` : `✓ ${pages.length} pages: links, anchors, assets, titles, descriptions, canonicals, h1s, alts all fine`);
process.exit(problems ? 1 : 0);
