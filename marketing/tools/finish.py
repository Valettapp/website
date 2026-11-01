"""Assemble the three reels: frames (+ the 1.5 s VALETT intro where there is one), the voiceover at fixed times,
then music.py adds the picture-synced music.  Every reel opens with "Meet Valett." (1 Nov, Leon: no
"Valet, without the wait." in the videos); the closing line is "Valett. Book your demo today."

usage: python3 marketing/tools/finish.py ad1|ad2|tutorial     (after the captures and intro-capture.mjs)
"""
import sys, subprocess, os, tempfile

V = 'marketing/voiceover'
MEET = (f'{V}/ad/k2.mp3', 0, 1.2)        # "Meet Valett." cut from the start of k2
CLOSE = f'{V}/ad/k9.mp3'                 # "Valett. Book your demo today."
REELS = {
    'ad1': dict(frames='marketing/raw/katana-v2', intro=None, pad=0, out='marketing/katana/valett-ad-v2.mp4',
                lines=[(f'{V}/ad/k1.mp3', 0.3), (MEET, 5.4), (f'{V}/ad/k3.mp3', 9.4), (f'{V}/ad/k4.mp3', 15.6), (f'{V}/ad/k5.mp3', 20.2),
                       (f'{V}/ad/k6.mp3', 26.0), (f'{V}/ad/k7.mp3', 29.6), (f'{V}/ad/k8.mp3', 35.8), (CLOSE, 38.8)]),
    'ad2': dict(frames='marketing/raw/ad2', intro='marketing/raw/intro-dark', pad=0, out='marketing/ad2/valett-ad2.mp4',
                lines=[(MEET, 0.2), (f'{V}/ad2/m1.mp3', 1.9), (f'{V}/ad2/m2.mp3', 8.4), (f'{V}/ad2/m3.mp3', 14.5), (f'{V}/ad2/m4.mp3', 19.5),
                       ((f'{V}/ad2/m5.mp3', 0, 2.2), 24.4), ((f'{V}/ad2/m5.mp3', 2.5, 3.16), 30.15), (CLOSE, 31.8)]),
    'tutorial': dict(frames='marketing/raw/tutorial-frames', intro='marketing/raw/intro-field', pad=1.6, out='marketing/reels/05-tutorial-VOICE-SIENNA.mp4',
                lines=[(MEET, 0.2), (f'{V}/sienna/t1.mp3', 2.0), (f'{V}/sienna/t2.mp3', 4.9), (f'{V}/sienna/t3.mp3', 9.2), (f'{V}/sienna/t4.mp3', 12.7),
                       (f'{V}/sienna/t5.mp3', 16.2), (f'{V}/sienna/t6.mp3', 19.3), (f'{V}/sienna/t7.mp3', 26.2), (CLOSE, 29.8)]),
}


def run(*a): subprocess.run(a, check=True)


def build(name):
    r = REELS[name]
    with tempfile.TemporaryDirectory() as d:
        body = os.path.join(d, 'body.mp4')
        run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-framerate', '30', '-i', f"{r['frames']}/f%04d.png", *(['-vf', f"tpad=stop_mode=clone:stop_duration={r['pad']}"] if r['pad'] else []),
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', body)
        video = body
        if r['intro']:
            intro = os.path.join(d, 'intro.mp4'); video = os.path.join(d, 'all.mp4')
            run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-framerate', '30', '-i', f"{r['intro']}/f%04d.png", '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', intro)
            run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', intro, '-i', body, '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]', '-map', '[v]',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', video)
        ins, f, labels = [], '', ''
        for i, (src, t) in enumerate(r['lines'], start=1):
            if isinstance(src, tuple):
                path, a, b = src; trim = f'atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=out:st={b - a - 0.12:.2f}:d=0.12,'
            else:
                path, trim = src, ''
            ins += ['-i', path]; ms = int(t * 1000)
            f += f'[{i}:a]aresample=48000,{trim}adelay={ms}|{ms}[a{i}];'; labels += f'[a{i}]'
        n = len(r['lines'])
        run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', video, *ins, '-filter_complex',
            f'{f}{labels}amix=inputs={n}:normalize=0:dropout_transition=0,highshelf=f=7000:g=-2,apad,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0[a]',
            '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-shortest', '-movflags', '+faststart', r['out'])
    print('wrote', r['out'])


if __name__ == '__main__':
    build(sys.argv[1])
