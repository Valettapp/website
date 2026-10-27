// Assembles the Valett film from the generated clips and the HTML-rendered overlays.
// Usage: node scripts/film/assemble.mjs <workdir>   (workdir holds clips/, overlays/; writes out/)
// Shot ids: shot01, shotA/B/C (27 Oct re-shoot of the arrival), shot06..shot10.
// Each shot: clip, trim, phone panel (real UI, slides in), caption. Output: 16:9 1080p and 9:16 720p.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const W = process.argv[2];
const clips = join(W, 'clips'), ov = join(W, 'overlays'), out = join(W, 'out');
mkdirSync(out, { recursive: true });
const FPS = 24;

// Shot list: file, length (s), panel [{img, from, to}], caption {img, from, to}
const shots = [
  { f: 'shot01.mp4', len: 6, cap: { img: 'c1.png', from: 1.2, to: 5.6 } },
  // Arrival, re-shot 27 Oct: the valet opens the door, the guest steps out (A); key handed over, the
  // guest scans the valet's phone (B); the guest walks in while the valet takes the car (C).
  { f: 'shotA.mp4', len: 7.5 },
  { f: 'shotB.mp4', len: 6, panels: [{ img: 'staff-scanning.png', from: 0.3, to: 2.0 }, { img: 'staff-ticket.png', from: 2.0, to: 4.0 }, { img: 'guest-1.png', from: 4.0, to: 6 }], cap: [{ img: 'c3.png', from: 0.6, to: 3.0 }, { img: 'c4.png', from: 3.4, to: 6 }] },
  { f: 'shotC.mp4', len: 5 },
  { f: 'shot06.mp4', len: 6 },
  { f: 'shot07.mp4', len: 4, panels: [{ img: 'guest-1.png', from: 0.4, to: 1.8 }, { img: 'guest-3.png', from: 1.8, to: 4 }], cap: { img: 'c7.png', from: 0.8, to: 4 } },
  { f: 'shot08.mp4', len: 4, panels: [{ img: 'guest-4.png', from: 0.3, to: 4 }], cap: { img: 'c8.png', from: 0.6, to: 4 } },
  { f: 'shot09.mp4', len: 3, panels: [{ img: 'guest-4.png', from: 0, to: 3 }], cap: { img: 'c9.png', from: 0.3, to: 3 } },
  { f: 'shot10.mp4', len: 8, panels: [{ img: 'guest-5.png', from: 0.6, to: 4.2 }], cap: { img: 'c10.png', from: 4.4, to: 7.8 } },
];
const END = 4; // end card seconds

function run(args) { execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' }); }

/** Builds one shot for a format. landscape: 1920x1080, panel right third; portrait: 1080x1920, panel lower centre. */
function buildShot(i, s, fmt) {
  const land = fmt === 'land';
  const vw = land ? 1920 : 1080, vh = land ? 1080 : 1920;
  const inputs = ['-i', join(clips, s.f)];
  const chains = [];
  // Base: scale/crop to format, trim to length, fade in on first and out on last shot handled at concat.
  const fit = land ? `scale=${vw}:${vh}:force_original_aspect_ratio=increase,crop=${vw}:${vh}` : `scale=-2:${vh},crop=${vw}:${vh}:(iw-${vw})/2:0`;
  chains.push(`[0:v]${fit},fps=${FPS},trim=duration=${s.len},setpts=PTS-STARTPTS[v0]`);
  let last = 'v0', n = 1;
  // Phone panels: real UI, scaled to 46% of frame height (landscape) / 44% (portrait), slides in 40 px with a fade.
  const ph = land ? Math.round(vh * 0.62) : Math.round(vh * 0.46);
  for (const p of s.panels ?? []) {
    inputs.push('-loop', '1', '-i', join(ov, p.img));
    const d = p.to - p.from;
    chains.push(`[${n}:v]scale=-2:${ph},format=rgba,fade=t=in:st=0:d=0.35:alpha=1,fade=t=out:st=${(d - 0.3).toFixed(2)}:d=0.3:alpha=1,trim=duration=${d},setpts=PTS-STARTPTS+${p.from}/TB[p${n}]`);
    const x = land ? `${vw}-w-96` : `(W-w)/2`;
    const y = land ? `(H-h)/2+40-40*min(1\\,(t-${p.from})/0.35)` : `H-h-300+40-40*min(1\\,(t-${p.from})/0.35)`;
    chains.push(`[${last}][p${n}]overlay=x=${x}:y=${y}:enable='between(t,${p.from},${p.to})':eof_action=pass[v${n}]`);
    last = `v${n}`; n++;
  }
  for (const cap of [].concat(s.cap ?? [])) {
    inputs.push('-loop', '1', '-i', join(ov, cap.img));
    const d = cap.to - cap.from;
    // caption strip rendered at 1920x200; portrait: scale to width 1080 (text re-wraps are avoided by short lines)
    const cs = land ? 'scale=1920:200' : 'scale=1080:-2';
    chains.push(`[${n}:v]${cs},format=rgba,fade=t=in:st=0:d=0.4:alpha=1,fade=t=out:st=${(d - 0.4).toFixed(2)}:d=0.4:alpha=1,trim=duration=${d},setpts=PTS-STARTPTS+${cap.from}/TB[c${n}]`);
    const y = land ? 'H-h' : 'H-h-120';
    chains.push(`[${last}][c${n}]overlay=x=0:y=${y}:enable='between(t,${cap.from},${cap.to})':eof_action=pass[v${n}]`);
    last = `v${n}`; n++;
  }
  // Audio: keep the clip's ambience if it has any, else silence
  const hasAudio = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', join(clips, s.f)]).toString().includes('audio');
  const aud = hasAudio ? `[0:a]atrim=duration=${s.len},asetpts=PTS-STARTPTS,aresample=48000[a]` : `anullsrc=r=48000:cl=stereo,atrim=duration=${s.len}[a]`;
  chains.push(aud);
  const o = join(out, `${fmt}-${String(i + 1).padStart(2, '0')}.mp4`);
  run([...inputs, '-filter_complex', chains.join(';'), '-map', `[${last}]`, '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-t', String(s.len), o]);
  return o;
}

function buildEnd(fmt) {
  const land = fmt === 'land';
  const img = join(ov, land ? 'end-card.png' : 'end-card-portrait.png');
  const o = join(out, `${fmt}-end.mp4`);
  run(['-loop', '1', '-i', img, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(END), '-vf', `fps=${FPS},format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st=${END - 0.8}:d=0.8`, '-c:v', 'libx264', '-crf', '17', '-c:a', 'aac', '-shortest', o]);
  return o;
}

function concat(files, fmt, final) {
  // Crossfade 0.5 s between shots (xfade + acrossfade), chained.
  const X = 0.5;
  const inputs = files.flatMap((f) => ['-i', f]);
  const lens = files.map((f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()));
  let v = '[0:v]', a = '[0:a]', off = 0; const ch = [];
  for (let i = 1; i < files.length; i++) {
    off += lens[i - 1] - X;
    ch.push(`${v}[${i}:v]xfade=transition=fade:duration=${X}:offset=${off.toFixed(3)}[v${i}]`);
    ch.push(`${a}[${i}:a]acrossfade=d=${X}[a${i}]`);
    v = `[v${i}]`; a = `[a${i}]`;
  }
  ch.push(`${a}loudnorm=I=-18:TP=-1.5:LRA=11[aout]`);
  const land = fmt === 'land';
  run([...inputs, '-filter_complex', ch.join(';'), '-map', v, '-map', '[aout]', '-c:v', 'libx264', '-preset', 'slow', '-crf', land ? '21' : '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '128k', final]);
}

for (const fmt of ['land', 'port']) {
  const files = shots.map((s, i) => { if (!existsSync(join(clips, s.f))) throw new Error(`missing ${s.f}`); return buildShot(i, s, fmt); });
  files.push(buildEnd(fmt));
  const final = join(out, fmt === 'land' ? 'valett-film-16x9.mp4' : 'valett-film-9x16.mp4');
  concat(files, fmt, final);
  console.log('wrote', final);
}
