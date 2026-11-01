"""Apple-style music for the Valett ads, synthesised in code (no samples, no licences) and cut to the picture.

Each video has a cue sheet (CUES below) taken from its capture script:
  sections  every scene change restarts the groove on a downbeat: the drums stop a beat before, a riser lifts
            into the cut and a crash lands on it. Energy per section: 0 tension (pad and ticks), 1 light
            (pad, plucks, hats, bass), 2 full (plus kick and clap), 3 resolve (pad and bells, no drums).
  events    sounds on what happens on screen: timer ticks, pops when chips or tiles appear, a click on every
            tap, the notification chime, a scan shimmer and confirm blip, the Apple Pay success chime,
            sparkles on the wordmark letters, swishes on the titles, an impact on the end card.
The groove is ducked under the voiceover; the on-screen sounds are ducked less so they stay in sync and audible.

usage:  python3 marketing/tools/music.py ad1|ad2|tutorial      (writes <video>-music.mp4 next to the video)
"""
import sys, subprocess, tempfile, os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(7)


def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def _b(kind, f, order=2): return signal.butter(order, f, kind, fs=SR)
def lp(x, fc, order=2): b, a = _b('low', min(fc, SR / 2 - 200), order); return signal.lfilter(b, a, x, axis=0)
def hp(x, fc, order=2): b, a = _b('high', fc, order); return signal.lfilter(b, a, x, axis=0)
def bp(x, lo, hi, order=2): b, a = _b('band', [lo, hi], order); return signal.lfilter(b, a, x, axis=0)


def sweep_lp(x, cut, block=1024):
    y = np.zeros_like(x); zi = np.zeros((2, x.shape[1])) if x.ndim == 2 else np.zeros(2)
    for i in range(0, len(x), block):
        b, a = _b('low', float(np.clip(cut[min(i, len(cut) - 1)], 60, SR / 2 - 300)))
        y[i:i + block], zi = signal.lfilter(b, a, x[i:i + block], axis=0, zi=zi)
    return y


def reverb_ir(sec=2.4, pre=0.02):
    n = int(sec * SR); t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * 6.9 / sec)[:, None]
    ir = lp(ir, 6500); ir[: int(pre * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def reverb(x, ir, wet=0.3):
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1) * wet


def place(buf, snd, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= len(buf) or i + len(snd) <= 0: return
    s = snd if snd.ndim == 2 else np.stack([snd * np.sqrt(0.5 * (1 - pan)), snd * np.sqrt(0.5 * (1 + pan))], axis=1)
    j0 = max(0, -i); i0 = max(0, i); n = min(len(s) - j0, len(buf) - i0)
    if n > 0: buf[i0:i0 + n] += s[j0:j0 + n] * gain


def T(sec): return np.arange(int(sec * SR)) / SR


# ---------- groove instruments ----------
def kick():
    t = T(0.45); ph = 2 * np.pi * np.cumsum(46 + 95 * np.exp(-t * 32)) / SR
    k = np.sin(ph) * np.exp(-t * 7.5) + 0.25 * np.exp(-t * 400) * rng.standard_normal(len(t))
    return np.tanh(1.6 * k) * 0.9


def clap():
    n = int(0.35 * SR); x = np.zeros(n)
    for d in (0, 0.009, 0.019):
        i = int(d * SR); m = int(0.012 * SR); x[i:i + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / (0.004 * SR))
    tail = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.07 * SR)) * 0.5; tail[: int(0.019 * SR)] = 0
    return bp(x + tail, 900, 3200) * 1.4


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    return hp(rng.standard_normal(n) * np.exp(-np.arange(n) / ((0.06 if open_ else 0.012) * SR)), 7500, 4) * 0.5


def crash():
    t = T(1.6); return hp(rng.standard_normal((len(t), 2)), 5000) * np.exp(-t * 2.6)[:, None] * 0.35


def saw(freq, n, detune=0.0):
    return 2 * ((np.arange(n) * freq * (1 + detune) / SR + rng.random()) % 1.0) - 1


def pad_chord(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR; L = np.zeros(n); R = np.zeros(n)
    for m in notes:
        f = midi(m); L += saw(f, n, -0.004) + 0.7 * saw(f, n, 0.006); R += saw(f, n, 0.004) + 0.7 * saw(f, n, -0.006)
    env = np.minimum(1, t / 0.45) * np.clip((dur - t) / 0.6, 0, 1)
    return lp(np.stack([L, R], 1) / (len(notes) * 1.7), 1400) * env[:, None]


def pluck(m, dur=0.5):
    t = T(dur); f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 9)
    a = int(0.002 * SR); x[:a] *= np.linspace(0, 1, a); return x * 0.5


def sub(m, dur):
    t = T(max(dur, 0.02)); x = np.sin(2 * np.pi * midi(m) * t)
    return np.tanh(2.2 * x) * np.minimum(1, t / 0.01) * np.exp(-t * 1.2) * np.clip((t[-1] - t) / 0.05, 0, 1) * 0.5


# ---------- on-screen sounds ----------
def bell(m, sec=1.0, bright=1.0):
    t = T(sec); f = midi(m)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in ((1, 1, 3), (2.76, .35 * bright, 6), (5.4, .18 * bright, 10), (2, .25, 4)))
    a = int(0.003 * SR); x[:a] *= np.linspace(0, 1, a); return x * 0.35


def tick():
    t = T(0.05); return (bp(rng.standard_normal(len(t)), 2500, 6500) * np.exp(-t * 260) + 0.4 * np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 120)) * 0.45


def pop(m=74):
    t = T(0.18); f = midi(m) * (1 + 0.6 * np.exp(-t * 90))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22) * 0.45


def tap():
    t = T(0.09); x = np.sin(2 * np.pi * np.cumsum(900 + 500 * np.exp(-t * 120)) / SR) * np.exp(-t * 60)
    return (x + 0.25 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300)) * 0.5


def swish(sec=0.45):
    n = int(sec * SR); k = np.arange(n) / n; env = np.sin(np.pi * k) ** 1.5
    y = sweep_lp(hp(rng.standard_normal((n, 2)), 400), 600 + 6000 * k, 256) * env[:, None]
    y[:, 0] *= 1 - 0.5 * k; y[:, 1] *= 0.5 + 0.5 * k  # moves left to right
    return y * 0.4


def whoosh(sec=0.9):
    n = int(sec * SR); k = np.arange(n) / n; env = np.sin(np.pi * k) ** 2
    return sweep_lp(rng.standard_normal((n, 2)), 300 + 5000 * np.sin(np.pi * k), 256) * env[:, None] * 0.5


def riser(sec=1.4):
    n = int(sec * SR); k = np.arange(n) / n
    return sweep_lp(hp(rng.standard_normal((n, 2)), 300), 400 + 9000 * k ** 2, 256) * (k ** 2.2)[:, None] * 0.55


def scan(sec=1.6):
    t = T(sec); k = t / sec
    x = np.sin(2 * np.pi * np.cumsum(700 + 1800 * k) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.sin(np.pi * k) * 0.18
    return x + hp(rng.standard_normal(len(t)), 8000) * np.sin(np.pi * k) * 0.06


def blip():
    return np.concatenate([bell(84, 0.09, 0.3)[: int(0.08 * SR)], bell(88, 0.5, 0.3)]) * 0.9


def chime():  # notification: two notes
    x = np.zeros(int(1.2 * SR)); x[: int(0.9 * SR)] += bell(81, 0.9)
    j = int(0.13 * SR); x[j:j + int(1.0 * SR)] += bell(88, 1.0)[: len(x) - j]; return x * 0.8


def success():  # Apple Pay done: quick rising chord
    x = np.zeros(int(1.6 * SR))
    for i, m in enumerate((74, 78, 81, 86)):
        j = int(i * 0.07 * SR); b = bell(m, 1.2, 0.6); x[j:j + len(b)] += b[: len(x) - j]
    return x * 0.75


def impact():
    t = T(2.5); ph = 2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 18)) / SR
    return np.tanh(2 * np.sin(ph) * np.exp(-t * 2.2)) * 0.8 + lp(rng.standard_normal(len(t)) * np.exp(-t * 5), 2500) * 0.25


def stab(chord):
    return sum(pluck(m + 12, 1.0) for m in chord) / len(chord) * 2.2


# ---------- arrangement ----------
CHORDS = [[50, 53, 57, 60, 64], [46, 50, 53, 57, 62], [53, 57, 60, 64, 67], [48, 52, 55, 62, 64]]  # Dm9 Bbmaj7 Fmaj7 Cadd9
ROOTS = [38, 34, 41, 36]
ARP = [[0, 2, 4, 3, 1, 3, 4, 2], [0, 3, 2, 4, 1, 2, 3, 4]]
PENT = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84]  # D minor pentatonic, for pops and sparkles


def render(dur, sections, end, events, bpm=104):
    beat = 60 / bpm; bar = 4 * beat; total = int((dur + 0.3) * SR)
    pads, plk, drums, bass, fx, sfx = (np.zeros((total, 2)) for _ in range(6))
    K, C, Ho, Hc = kick(), clap(), hat(True), hat()
    pump = np.zeros(total); kk = np.exp(-np.arange(int(0.3 * SR)) / (0.09 * SR))
    bounds = [s[0] for s in sections] + [end]
    for si, (t0, energy) in enumerate(sections):
        t1 = bounds[si + 1]
        stop = t1 - beat if si + 1 < len(sections) and sections[si + 1][1] >= 1 else t1  # drums drop a beat before the cut
        b = 0
        while t0 + b * bar < t1:
            bs = t0 + b * bar; ci = (si * 2 + b) % 4; ch = CHORDS[ci]
            place(pads, pad_chord(ch, min(bar, t1 - bs) + 0.5), bs, 0.9 if energy else 0.7)
            for s in range(8):
                tt = bs + s * beat / 2 + (0.035 if s % 2 else 0)
                if energy in (1, 2) and tt < stop:
                    place(plk, pluck(ch[ARP[b % 2][s] % len(ch)] + 12), tt, 0.55 if energy == 2 else 0.42, pan=(-0.35 if s % 2 else 0.35))
                    place(drums, Ho if (s == 7 and b % 2 and energy == 2) else Hc, tt, 0.3 if s % 2 else 0.18, pan=0.25)
            if energy == 2:
                for k_ in [0, 2] + ([2.5] if b % 2 else []):
                    tk = bs + k_ * beat
                    if tk < stop:
                        place(drums, K, tk, 0.95); i = int(tk * SR); m = min(len(kk), total - i)
                        if m > 0: pump[i:i + m] = np.maximum(pump[i:i + m], kk[:m])
                for c_ in (1, 3):
                    if bs + c_ * beat < stop: place(drums, C, bs + c_ * beat, 0.42, pan=0.05)
            if energy in (1, 2) and bs < stop:
                place(bass, sub(ROOTS[ci], min(bar * 0.95, stop - bs)), bs, 0.8)
            b += 1
        if si > 0:  # into the cut: riser, then crash and kick on it
            place(fx, riser(1.3), t0 - 1.3, 0.45)
            if energy >= 1: place(drums, crash(), t0, 0.7); place(drums, K, t0, 0.8)
    # end card: riser, impact, the first chord rings out
    place(fx, riser(1.6), end - 1.6, 0.55); place(fx, impact(), end, 0.75); place(pads, pad_chord(CHORDS[0], dur - end + 0.3), end, 0.85)
    # opening: the pads and plucks open from a filtered start until the first full section
    first_full = next((s[0] for s in sections if s[1] == 2), sections[0][0])
    ti = np.arange(total) / SR
    cut = np.where(ti < first_full, 450 + 7000 * (ti / max(first_full, 0.1)) ** 2, 9000.0)
    pads = sweep_lp(pads, cut); plk = sweep_lp(plk, cut)
    for ev in events:
        t, kind = ev[0], ev[1]; arg = ev[2] if len(ev) > 2 else None
        if kind == 'ticks':  # accelerating clock ticks from t to arg
            x = t; gap = 0.32
            while x < arg: place(sfx, tick(), x, 0.7, pan=0.2 * np.sin(x * 9)); x += gap; gap = max(0.07, gap * 0.9)
        elif kind == 'pop': place(sfx, pop(PENT[(arg or 0) % len(PENT)]), t, 0.85)
        elif kind == 'tap': place(sfx, tap(), t, 0.9)
        elif kind == 'swish': place(sfx, swish(0.45), t - 0.15, 0.8)
        elif kind == 'whoosh': place(sfx, whoosh(0.9), t - 0.4, 0.9)
        elif kind == 'chime': place(sfx, chime(), t, 0.9)
        elif kind == 'success': place(sfx, success(), t, 1.0)
        elif kind == 'scan': place(sfx, scan(arg or 1.6), t, 0.9)
        elif kind == 'blip': place(sfx, blip(), t, 0.8)
        elif kind == 'stab': place(sfx, stab(CHORDS[0]), t, 0.9)
        elif kind == 'sparkle':
            for i in range(arg or 6): place(sfx, bell(PENT[3 + i], 0.9, 0.5), t + i * 0.08, 0.35, pan=-0.5 + i * 0.2)
        elif kind == 'faceid': place(sfx, bell(93, 0.4, 0.2) * 0.5, t, 0.6)
    duck = (1 - 0.45 * pump)[:, None]
    ir = reverb_ir()
    music = pads * duck * 0.55 + plk * 0.5 + drums * 0.62 + bass * duck * 0.5 + fx * 0.5
    music += reverb(pads * 0.4 + plk * 0.9 + drums * 0.25 + fx * 0.6, ir, 0.33)
    sfx = sfx + reverb(sfx, ir, 0.22)
    out = []
    for x in (music, sfx):
        x = hp(x, 28); x = np.tanh(x * 1.1) / np.tanh(1.1)
        fade = np.ones(total); fo = int(0.8 * SR); fade[int(dur * SR) - fo:int(dur * SR)] = np.linspace(1, 0, fo)
        out.append((x * fade[:, None])[: int(dur * SR)])
    pk = max(np.abs(out[0]).max(), 1e-9)
    return out[0] / pk * 0.89, out[1] / pk * 0.89


# Cue sheets from the capture scripts (seconds). Taps sound when the finger lands (ripple peak / click).
CUES = {
    'ad1': dict(video='marketing/katana/valett-ad-v2.mp4', dur=42.5, end=38.5,
        sections=[(0.0, 0), (5.45, 2), (9.2, 1), (15.2, 2), (20.0, 2), (26.0, 1), (29.7, 2), (35.6, 3)],
        events=[(0.6, 'ticks', 3.4), (3.4, 'stab'), (2.65, 'pop', 6), (4.85, 'whoosh'), (5.45, 'sparkle', 6), (6.8, 'swish'),
                (9.25, 'whoosh'), (9.9, 'swish'), (10.8, 'scan', 1.7), (12.6, 'blip'), (11.5, 'pop', 2), (12.75, 'pop', 3), (13.5, 'pop', 4), (14.1, 'pop', 5),
                (15.25, 'whoosh'), (15.75, 'swish'), (16.6, 'swish'), (17.4, 'pop', 4), (18.0, 'pop', 5), (18.6, 'pop', 6),
                (20.0, 'whoosh'), (20.3, 'swish'), (22.7, 'tap'), (24.3, 'tap'), (26.0, 'swish'), (27.2, 'chime'),
                (29.7, 'swish'), (30.9, 'tap'), (31.7, 'tap'), (33.8, 'faceid'), (35.85, 'success'), (35.6, 'swish')]),
    'ad2': dict(video='marketing/ad2/valett-ad2.mp4', dur=33.6, end=29.45,
        sections=[(0.0, 1), (1.3, 2), (6.6, 2), (12.9, 1), (17.9, 2), (22.7, 2)],
        events=[(0.2, 'whoosh'), (0.3, 'swish'), (1.4, 'pop', 3), (1.9, 'scan', 1.7), (3.7, 'blip'),
                (6.4, 'whoosh'), (6.8, 'swish'), (7.75, 'chime'), (8.6, 'pop', 5),
                (12.95, 'swish'), (14.45, 'tap'), (15.9, 'tap'),
                (17.9, 'pop', 2), (18.22, 'pop', 3), (18.54, 'pop', 4), (18.6, 'pop', 6), (19.1, 'pop', 7),
                (22.75, 'swish'), (23.6, 'tap'), (24.45, 'tap'), (26.67, 'faceid'), (28.72, 'success')]),
    'tutorial': dict(video='marketing/reels/05-tutorial-VOICE-SIENNA.mp4', dur=31.7, end=27.8,
        sections=[(0.0, 1), (3.4, 1), (6.2, 2), (12.4, 2), (16.6, 2), (24.6, 3)],
        events=[(0.3, 'pop', 0), (3.4, 'pop', 1), (3.45, 'swish'), (6.2, 'pop', 2), (7.58, 'tap'), (9.4, 'pop', 3), (10.78, 'tap'),
                (12.4, 'pop', 4), (16.6, 'pop', 5), (17.58, 'tap'), (18.78, 'tap'), (20.88, 'faceid'), (22.93, 'success'), (24.6, 'pop', 6)]),
}


def read_wav(path):
    sr, x = wavfile.read(path); x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    return np.stack([x, x], 1) if x.ndim == 1 else x


def mix_video(video, music, sfx, out, music_db=-12.0):
    with tempfile.TemporaryDirectory() as d:
        vo = os.path.join(d, 'vo.wav')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', video, '-vn', '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s16le', vo], check=True)
        v = read_wav(vo); n = len(v)
        fit = lambda a: np.pad(a, ((0, max(0, n - len(a))), (0, 0)))[:n]
        music, sfx = fit(music), fit(sfx)
        e = np.sqrt(signal.lfilter([1 - 0.995], [1, -0.995], (v ** 2).mean(1)))
        on = (e > 0.02).astype(float); att, rel = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.45 * SR))
        g = np.zeros(n); s = 0.0
        for i in range(0, n, 64):
            tg = on[i]; c = att if tg > s else rel; s = tg + (s - tg) * c ** 64; g[i:i + 64] = s
        rms_v = np.sqrt((v[on > 0] ** 2).mean()) if on.any() else 0.1
        k = rms_v * 10 ** (music_db / 20) * 1.9 / (np.sqrt((music ** 2).mean()) + 1e-9)
        y = v + music * k * (1 - 0.7 * g)[:, None] + sfx * k * (1 - 0.3 * g)[:, None]
        mw = os.path.join(d, 'mix.wav'); wavfile.write(mw, SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', video, '-i', mw, '-filter_complex',
                        '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]', '-map', '0:v', '-map', '[a]',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-shortest', '-movflags', '+faststart', out], check=True)


if __name__ == '__main__':
    name = sys.argv[1]; c = CUES[name]
    music, sfx = render(c['dur'], c['sections'], c['end'], c['events'])
    os.makedirs('marketing/music', exist_ok=True)
    for x, tag in ((music, 'bed'), (sfx, 'sfx')):
        p = f'marketing/music/{name}-{tag}.wav'; wavfile.write(p, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', p, '-c:a', 'aac', '-b:a', '192k', p[:-4] + '.m4a'], check=True); os.remove(p)
    out = c['video'][:-4] + '-music.mp4'
    mix_video(c['video'], music, sfx, out); print('wrote', out)
