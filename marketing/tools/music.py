"""Apple-style instrumental bed for the Valett ads, synthesised in code (no samples, no licences).

Minimal chill-electronic: warm detuned pad chords, a plucked arpeggio with ping-pong echo, soft sub bass,
a light kick / clap / swung hats groove, risers and swooshes into each scene change, an impact on the end card
and a reverb tail. Then ducked under the voiceover and mixed.

usage:
  python3 marketing/tools/music.py bed  --dur 42.5 --beat-in 4.85 --end 38.5 --cuts 9.2,15.2,20,26,29.7,35.6 --out music.wav
  python3 marketing/tools/music.py mix  --video in.mp4 --music music.wav --out out.mp4
"""
import argparse, subprocess, tempfile, os
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR / 2 - 100) / (SR / 2), 'low'); return signal.lfilter(b, a, x, axis=0)


def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x, axis=0)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x, axis=0)


def sweep_lp(x, cut, block=1024):
    """Time-varying low-pass: cut is an array of cutoffs per sample (mono or stereo x)."""
    y = np.zeros_like(x); zi = None
    for i in range(0, len(x), block):
        fc = float(np.clip(cut[min(i, len(cut) - 1)], 60, SR / 2 - 200))
        b, a = signal.butter(2, fc / (SR / 2), 'low')
        if zi is None:
            zi = np.zeros((2, x.shape[1])) if x.ndim == 2 else np.zeros(2)
        seg_ = x[i:i + block]
        y[i:i + block], zi = signal.lfilter(b, a, seg_, axis=0, zi=zi)
    return y


def reverb_ir(sec=2.4, pre=0.02):
    n = int(sec * SR); t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * 6.9 / sec)[:, None]
    ir = lp(ir, 6500); ir[: int(pre * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=0))


def reverb(x, ir, wet=0.3):
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return y * wet


def place(buf, snd, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= len(buf) or i + len(snd) <= 0: return
    s = snd if snd.ndim == 2 else np.stack([snd * np.sqrt(0.5 * (1 - pan)), snd * np.sqrt(0.5 * (1 + pan))], axis=1)
    j0 = max(0, -i); i0 = max(0, i); n = min(len(s) - j0, len(buf) - i0)
    buf[i0:i0 + n] += s[j0:j0 + n] * gain


# ---------- instruments ----------
def kick():
    t = np.arange(int(0.45 * SR)) / SR
    f = 46 + 95 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    k = np.sin(ph) * np.exp(-t * 7.5)
    k += 0.25 * np.exp(-t * 400) * rng.standard_normal(len(t))  # click
    return np.tanh(1.6 * k) * 0.9


def clap():
    n = int(0.35 * SR); x = np.zeros(n)
    for d in (0, 0.009, 0.019):
        i = int(d * SR); m = int(0.012 * SR); x[i:i + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / (0.004 * SR))
    tail = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.07 * SR)) * 0.5; tail[: int(0.019 * SR)] = 0
    return bp(x + tail, 900, 3200) * 1.4


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / ((0.06 if open_ else 0.012) * SR))
    return hp(x, 7500, 4) * 0.5


def saw(freq, n, detune=0.0):
    ph = (np.arange(n) * freq * (1 + detune) / SR + rng.random()) % 1.0
    return 2 * ph - 1


def pad_chord(notes, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    L = np.zeros(n); R = np.zeros(n)
    for m in notes:
        f = midi(m)
        L += saw(f, n, -0.004) + 0.7 * saw(f, n, 0.006)
        R += saw(f, n, 0.004) + 0.7 * saw(f, n, -0.006)
    x = np.stack([L, R], 1) / (len(notes) * 1.7)
    env = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.7).clip(0, 1)
    return lp(x, 1400, 2) * env[:, None]


def pluck(m, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 9)
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return x * 0.5


def sub(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * midi(m) * t)
    env = np.minimum(1, t / 0.01) * np.exp(-t * 1.2) * np.minimum(1, (dur - t) / 0.05).clip(0, 1)
    return np.tanh(2.2 * x) * env * 0.5  # a little drive so phones hear it


def riser(sec=1.6):
    n = int(sec * SR); t = np.arange(n) / SR; k = t / sec
    x = rng.standard_normal((n, 2))
    y = sweep_lp(hp(x, 300), 400 + 9000 * k ** 2) * (k ** 2.2)[:, None]
    return y * 0.55


def whoosh(sec=0.9):
    n = int(sec * SR); t = np.arange(n) / SR; k = t / sec
    env = np.sin(np.pi * k) ** 2
    y = sweep_lp(rng.standard_normal((n, 2)), 300 + 5000 * np.sin(np.pi * k)) * env[:, None]
    return y * 0.5


def impact():
    t = np.arange(int(2.5 * SR)) / SR
    f = 38 + 60 * np.exp(-t * 18); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.tanh(2 * np.sin(ph) * np.exp(-t * 2.2)) * 0.8
    x += lp(rng.standard_normal(len(t)) * np.exp(-t * 5), 2500) * 0.25
    return x


# ---------- arrangement ----------
# D minor colour, one chord per bar: Dm9, Bbmaj7, Fmaj7, C(add9)
CHORDS = [[50, 53, 57, 60, 64], [46, 50, 53, 57, 62], [53, 57, 60, 64, 67], [48, 52, 55, 62, 64]]
ROOTS = [38, 34, 41, 36]
ARP = [[0, 2, 4, 3, 1, 3, 4, 2], [0, 3, 2, 4, 1, 2, 3, 4]]


def bed(dur, beat_in, end, cuts, bpm=104):
    beat = 60 / bpm; bar = 4 * beat
    total = int((dur + 0.2) * SR)
    pads = np.zeros((total, 2)); plk = np.zeros((total, 2)); drums = np.zeros((total, 2)); bass = np.zeros((total, 2)); fx = np.zeros((total, 2))
    t0 = beat_in - bar * np.ceil(beat_in / bar)  # bar grid with a downbeat on beat_in, starting before 0
    K, C, Ho, Hc = kick(), clap(), hat(True), hat()
    b = 0
    while True:
        bs = t0 + b * bar
        if bs >= dur: break
        ci = b % 4; ch = CHORDS[ci]
        if bs + bar > 0 and bs < end + 0.5:
            place(pads, pad_chord(ch, bar + 0.6), bs, 0.9)
        groove = beat_in <= bs + 1e-6 < end - 0.01
        for s in range(8):  # eighth-note pluck arpeggio, swung
            tt = bs + s * beat / 2 + (0.035 if s % 2 else 0)
            if 0 <= tt < end:
                note = ch[ARP[b % 2][s] % len(ch)] + 12
                place(plk, pluck(note), tt, 0.55 if groove else 0.35, pan=(-0.35 if s % 2 else 0.35))
        if groove:
            for k_ in ([0, 2] + ([2.5] if b % 2 else [])):
                place(drums, K, bs + k_ * beat, 0.95)
            for c_ in (1, 3):
                place(drums, C, bs + c_ * beat, 0.42, pan=0.05)
            for h in range(8):
                sw = 0.035 if h % 2 else 0
                place(drums, Ho if h == 7 and b % 2 else Hc, bs + h * beat / 2 + sw, (0.32 if h % 2 else 0.2), pan=0.25)
            place(bass, sub(ROOTS[ci], bar * 0.95), bs, 0.85)
            place(bass, sub(ROOTS[ci] + 12, beat * 0.5), bs + 2.5 * beat, 0.35)
        b += 1
    # intro: the pad and plucks open up from a filtered start; the outro lets the last chord ring
    cut = np.full(total, 9000.0); ti = np.arange(total) / SR
    cut = np.where(ti < beat_in, 500 + 8500 * (ti / max(beat_in, 0.1)) ** 2, cut)
    pads = sweep_lp(pads, cut); plk = sweep_lp(plk, cut)
    # transitions
    for c in cuts:
        place(fx, riser(1.4), c - 1.4, 0.5); place(fx, whoosh(0.8), c - 0.35, 0.45)
    if beat_in > 1.5:
        place(fx, riser(min(2.0, beat_in - 0.2)), beat_in - min(2.0, beat_in - 0.2), 0.55)
    place(fx, riser(1.8), end - 1.8, 0.6); place(fx, impact(), end, 0.75)
    place(pads, pad_chord(CHORDS[0], dur - end + 0.2) * 1.0, end, 0.8)
    # sidechain pump from the kick on pads and bass
    env = np.zeros(total); kk = np.exp(-np.arange(int(0.3 * SR)) / (0.09 * SR))
    b = 0
    while True:
        bs = t0 + b * bar
        if bs >= end: break
        if bs >= beat_in - 1e-6:
            for k_ in ([0, 2] + ([2.5] if b % 2 else [])):
                i = int((bs + k_ * beat) * SR)
                if 0 <= i < total: env[i:i + len(kk)] = np.maximum(env[i:i + len(kk)], kk[: total - i])
        b += 1
    duck = (1 - 0.45 * env)[:, None]
    ir = reverb_ir()
    mix = pads * duck * 0.55 + plk * 0.5 + drums * 0.62 + bass * duck * 0.5 + fx * 0.5
    mix += reverb(pads * 0.4 + plk * 0.9 + drums * 0.25 + fx * 0.6, ir, 0.33)
    mix = hp(mix, 28)
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    fade = np.ones(total); fo = int(0.8 * SR); fade[-fo:] = np.linspace(1, 0, fo)
    mix = mix[: int(dur * SR)] * fade[: int(dur * SR)][:, None]
    return mix / (np.abs(mix).max() + 1e-9) * 0.89


def read_wav(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    if x.ndim == 1: x = np.stack([x, x], 1)
    return x


def mix_video(video, music_path, out, music_db=-12.0):
    with tempfile.TemporaryDirectory() as d:
        vo = os.path.join(d, 'vo.wav')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', video, '-vn', '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s16le', vo], check=True)
        v = read_wav(vo); m = read_wav(music_path)
        n = len(v); m = np.pad(m, ((0, max(0, n - len(m))), (0, 0)))[:n]
        # voice envelope -> duck the music about 9 dB under speech, back up between lines
        e = np.sqrt(signal.lfilter([1 - 0.995], [1, -0.995], (v ** 2).mean(1)))
        on = (e > 0.02).astype(float)
        att, rel = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.45 * SR))
        g = np.zeros(n); s = 0.0
        for i in range(0, n, 64):
            target = on[i]; c = att if target > s else rel; s = target + (s - target) * c ** 64; g[i:i + 64] = s
        rms_v = np.sqrt((v[on > 0] ** 2).mean()) if on.any() else 0.1
        rms_m = np.sqrt((m ** 2).mean()) + 1e-9
        m = m / rms_m * rms_v * 10 ** (music_db / 20) * 1.9  # bed level relative to the voice
        m *= (1 - 0.7 * g)[:, None]
        y = v + m
        mw = os.path.join(d, 'mix.wav'); wavfile.write(mw, SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', video, '-i', mw, '-filter_complex',
                        '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]', '-map', '0:v', '-map', '[a]',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-shortest', '-movflags', '+faststart', out], check=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('cmd', choices=['bed', 'mix'])
    ap.add_argument('--dur', type=float); ap.add_argument('--beat-in', type=float, default=0.5); ap.add_argument('--end', type=float)
    ap.add_argument('--cuts', default=''); ap.add_argument('--bpm', type=float, default=104)
    ap.add_argument('--video'); ap.add_argument('--music'); ap.add_argument('--out', required=True); ap.add_argument("--music-db", type=float, default=-12.0)
    a = ap.parse_args()
    if a.cmd == 'bed':
        cuts = [float(c) for c in a.cuts.split(',') if c]
        y = bed(a.dur, a.beat_in, a.end, cuts, a.bpm)
        wavfile.write(a.out, SR, (y * 32767).astype(np.int16)); print('wrote', a.out, len(y) / SR, 's')
    else:
        mix_video(a.video, a.music, a.out, a.music_db); print('wrote', a.out)
