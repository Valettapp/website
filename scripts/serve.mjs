// Minimal static server for dist/ (used by screenshots + lighthouse scripts).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';
// Compress text the way GitHub Pages does, so Lighthouse measures what visitors download.
const compressible = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt', '.webmanifest', '.vtt']);

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.avif': 'image/avif', '.xml': 'application/xml', '.txt': 'text/plain',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.vtt': 'text/vtt',
};

export function serve(dir, port = 4321) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = join(root, p);
      let s = await stat(file).catch(() => null);
      if (s?.isDirectory()) { file = join(file, 'index.html'); s = await stat(file).catch(() => null); }
      if (!s) { file = join(root, p + '.html'); s = await stat(file).catch(() => null); }
      if (!s) { file = join(root, '404.html'); s = await stat(file).catch(() => null); if (!s) { res.writeHead(404); res.end('Not found'); return; } res.statusCode = 404; }
      let data = await readFile(file);
      const ext = extname(file);
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      if (compressible.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) { data = gzipSync(data); res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); }
      if (p.startsWith('/_astro/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.end(data);
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2] || 4321);
  await serve('dist', port);
  console.log(`serving dist on http://127.0.0.1:${port}`);
}
