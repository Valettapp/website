// Guard for the preview publish: every asset the page references must exist in preview/. Run before publishing.
import { readFileSync, existsSync } from 'node:fs';
const html = readFileSync('preview/index.html', 'utf8');
const refs = [...new Set([...html.matchAll(/(?:src|href)="((?:assets|film)\/[^"]+)"/g)].map((m) => m[1]))];
const missing = refs.filter((r) => !existsSync('preview/' + r));
if (missing.length) { console.error('MISSING in preview/:', missing); process.exit(1); }
console.log(`preview ok: ${refs.length} referenced files present`);
