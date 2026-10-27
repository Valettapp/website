// Turns dist/ into a relative-path bundle for a hosted preview (claude.ai artifact or any static host
// that serves from a subfolder). Output: preview/ (gitignored). Run `npm run build` first.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] || 'preview';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync('dist', out, { recursive: true });

// privacy/index.html → privacy.html; drop 404 and sitemaps.
cpSync(join(out, 'privacy/index.html'), join(out, 'privacy.html'));
for (const p of ['privacy', '404.html', 'sitemap-0.xml', 'sitemap-index.xml']) rmSync(join(out, p), { recursive: true, force: true });
renameSync(join(out, '_astro'), join(out, 'assets')); // "_" prefixes are reserved on the artifact host

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const rewrite = (s) => s
  .replace(/\/_astro\//g, 'assets/')
  .replace(/href="\/privacy"/g, 'href="privacy.html"')
  .replace(/href="\/(favicon\.svg|favicon\.ico|apple-touch-icon\.png|site\.webmanifest)"/g, 'href="$1"')
  .replace(/href="\/"/g, 'href="index.html"')
  .replace(/<link rel="sitemap"[^>]*>/g, '');
for (const f of walk(out)) {
  if (!/\.(html|css)$/.test(f)) continue;
  let s = readFileSync(f, 'utf8');
  s = rewrite(s);
  if (f.endsWith('index.html') && f.split('/').length === 2) {
    // The artifact host wraps the page in its own document skeleton: strip ours.
    s = s.replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>/i, '').replace('</html>', '')
      .replace(/<\/?head>/gi, '').replace(/<body([^>]*)>/i, '<div id="top" class="min-h-dvh bg-bg text-ink antialiased">').replace('</body>', '</div>')
      .replace(/<meta charset="utf-8">\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '')
      .replace(/<title>[^<]*<\/title>/, '<title>Valett</title>');
  }
  writeFileSync(f, s);
}
const files = walk(out).map((f) => f.slice(out.length + 1)).filter((f) => f !== 'index.html').sort();
writeFileSync(join(out, '..', 'preview-files.json'), JSON.stringify(files));
console.log(`${files.length + 1} files in ${out}/`);
