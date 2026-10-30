# Apple Pay loop: Kling clip (phone + parked Defender, lights come on) + the real guest screens on the phone, frame by frame:
# Bringing (tip 80) -> tap Pay with Apple Pay -> sheet slides up -> Double-click to pay -> Face ID -> Done -> sheet away
# -> Safe travels -> hold -> dissolve back.  usage: applepay.py clip.mp4 still.png out.mp4
import sys, json, cv2, numpy as np, subprocess
from PIL import Image, ImageFilter
clip, still_p, out_p = sys.argv[1:4]
PHONE_ONLY = clip == 'STILL'  # no Kling clip: static studio still with just the phone, plus a slow push-in
D = sys.path[0]; SCR = '/tmp/claude-0/-home-user-website/17dcb022-c78c-57d1-931f-5ad9c3653355/scratchpad'
W, H, FPS = 1920, 1080, 30

# ---- screens with the iPhone status bar (dark text) over the photo top ----
src = np.array(Image.open(f'{SCR}/promo2/statusbar.png').convert('RGBA')); bh, bw = src.shape[:2]; s = bw / 393
isl = np.zeros((bh, bw), bool); isl[:, int((196.5 - 66) * s):int((196.5 + 66) * s)] = True
bar = src.copy(); bar[~isl, :3] = 255; bar[isl, :3] = 0; bar = Image.fromarray(bar)  # white text over the photo
def with_bar(img, aspect):
    # Screens are captured at the phone's exact shape, so the status bar and Dynamic Island simply sit over the photo.
    # (If a capture were shorter than the phone, the photo's top edge would be extended to make up the difference.)
    img = img.convert('RGB'); w, h = img.size; need = round(w / aspect) - h
    if need > 4:
        top = img.crop((0, 0, w, 24)).resize((w, need), Image.BICUBIC).filter(ImageFilter.GaussianBlur(40))
        img = Image.fromarray(np.vstack([np.array(top), np.array(img)]))
    bh_ = round(54 * w / 393); out = img.copy(); bb = bar.resize((w, bh_), Image.LANCZOS); out.paste(bb, (0, 0), bb)
    return np.array(out)[:, :, ::-1].copy()  # BGR
cap = {n: Image.open(f'{D}/{n}.png') for n in ['s4', 's4tap', 'dim', 'ap-in', 'ap-confirm', 'ap-faceid', 'ap-done', 's5']}
k3 = cap['s4'].width / 338.0
r = json.load(open(f'{D}/rect.json')); sx, sy, sw, sh = [round(v * k3) for v in (r['x'], r['y'], r['w'], r['h'])]
sheet = cap['ap-in'].convert('RGB').crop((sx, sy, sx + sw, sy + sh)); sheet_done = cap['ap-done'].convert('RGB').crop((sx, sy, sx + sw, sy + sh))
mask = Image.new('L', (sw, sh), 0); from PIL import ImageDraw; ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw - 1, sh - 1), radius=round(26 * k3), fill=255)
def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3
def sheet_frame(bg_a, bg_b, k_bg, sheet_img, off):
    bg = Image.blend(bg_a.convert('RGB'), bg_b.convert('RGB'), k_bg).copy()
    bg.paste(sheet_img, (sx, sy + round(off * (sh + sx))), mask); return bg

# ---- phone geometry in the still (same method as the Request My Car loop) ----
def quad_of_phone(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV); h, w = img.shape[:2]
    dark = (hsv[..., 2] < 45).astype(np.uint8)
    if not PHONE_ONLY: dark[:, w // 2:] = 0  # the scene with the car: the phone is on the left
    dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark); i = max(range(1, n), key=lambda k: st[k, cv2.CC_STAT_AREA])
    m = cv2.dilate(cv2.morphologyEx((lab == i).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8)), np.ones((3, 3), np.uint8))
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max(); hh, ww = y1 - y0, x1 - x0
    def fit(pts):
        vx, vy, px, py = cv2.fitLine(np.float32(pts), cv2.DIST_HUBER, 0, .01, .01).ravel(); return np.array([px, py]), np.array([vx, vy])
    def inter(a, b):
        (p, d), (q, e) = a, b; t = np.linalg.solve(np.array([d, -e]).T, q - p); return p + t[0] * d
    L, R, T, B = [], [], [], []
    for y in range(int(y0 + .2 * hh), int(y1 - .2 * hh), 2): rr = np.nonzero(m[y])[0]; L.append((rr.min(), y)); R.append((rr.max(), y))
    for x in range(int(x0 + .25 * ww), int(x1 - .25 * ww), 2): c = np.nonzero(m[:, x])[0]; T.append((x, c.min())); B.append((x, c.max()))
    l, rgt, t, b = map(fit, (L, R, T, B))
    return np.float32([inter(t, l), inter(t, rgt), inter(b, rgt), inter(b, l)]), m
still = cv2.resize(cv2.imread(still_p), (W, H), interpolation=cv2.INTER_AREA)
q, glass = quad_of_phone(still)
c = q.mean(0); qi = c + (q - c) * (1 - 0.030); qi[2:, 1] += 0.007 * (q[3][1] - q[0][1])
qw = (np.linalg.norm(qi[1] - qi[0]) + np.linalg.norm(qi[2] - qi[3])) / 2; qh = (np.linalg.norm(qi[3] - qi[0]) + np.linalg.norm(qi[2] - qi[1])) / 2
target = qw / qh
def fit_ui(ui):
    uh, uw = ui.shape[:2]
    if uw / uh > target: nw = round(uh * target); return ui[:, (uw - nw) // 2:(uw - nw) // 2 + nw]
    nh = round(uw / target); cut = int(uh * .5); return np.vstack([ui[:cut], ui[cut + (uh - nh):]])
mask_s = None
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); g = ((xx - q[0][0]) / qw + (yy - q[0][1]) / qh) / 2
sheen = np.clip(0.06 * (1 - np.abs(g - 0.35) / 0.35), 0, None)[..., None]
def warp(pil):
    global mask_s
    ui = fit_ui(with_bar(pil, target)); uh, uw = ui.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [uw, 0], [uw, uh], [0, uh]]), qi)
    if mask_s is None:
        inner = cv2.warpPerspective(np.full((uh, uw), 255, np.uint8), M, (W, H))
        gl = cv2.erode(glass * 255, np.ones((3, 3), np.uint8), iterations=max(1, int(qw * .015)))
        mask_s = cv2.GaussianBlur(np.minimum(inner, gl).astype(np.float32) / 255, (0, 0), 1.2)[..., None]
    w_ = cv2.warpPerspective(ui, M, (W, H), flags=cv2.INTER_AREA).astype(np.float32)
    return w_ * (1 - sheen) + 255 * sheen

# ---- timeline (seconds) ----
T_TAP, T_UP, T_CONF, T_FACE, T_DONE, T_OUT, T_S5, T_END, FADE = 1.2, 1.35, 1.85, 3.25, 4.1, 5.2, 5.75, 8.8, 0.7
cache = {}
def screen_at(t):
    if t < T_TAP: key = ('s4',)
    elif t < T_UP: key = ('s4tap',)
    elif t < T_CONF:
        k = ease((t - T_UP) / (T_CONF - T_UP)); key = ('up', round(k, 3))
    elif t < T_FACE: key = ('ap-confirm',)
    elif t < T_DONE: key = ('ap-faceid',)
    elif t < T_OUT: key = ('ap-done',)
    elif t < T_S5:
        k = ease((t - T_OUT) / (T_S5 - T_OUT)); key = ('down', round(k, 3))
    else: key = ('s5',)
    if key not in cache:
        if key[0] == 'up': img = sheet_frame(cap['s4'], cap['dim'], key[1], sheet, 1 - key[1])
        elif key[0] == 'down':
            k = key[1]; img = sheet_frame(cap['dim'], cap['s4'], k, sheet_done, k)
            if k > 0.6: img = Image.blend(img, cap['s5'].convert('RGB'), (k - 0.6) / 0.4)
        else: img = cap[key[0]]
        cache[key] = warp(img)
    return cache[key]

if PHONE_ONLY:
    frames = still[None]
else:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', clip, '-vf', f'scale={W}:{H}:flags=lanczos,fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
pc = q.mean(0)
def push(img, t):  # slow push-in towards the phone (phone-only version)
    if not PHONE_ONLY: return img
    k = min(1.0, t / (T_END - FADE)); k = k * k * (3 - 2 * k); sc = 1 + 0.05 * k
    M = np.float32([[sc, 0, pc[0] * (1 - sc)], [0, sc, pc[1] * (1 - sc)]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
OFF = int(T_UP * FPS)  # Kling clip starts when the sheet comes up, so the lights come on around Done
N = int(T_END * FPS)
first = (frames[0].astype(np.float32) * (1 - mask_s if mask_s is not None else 1))
proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', out_p], stdin=subprocess.PIPE)
start_frame = None
for i in range(N):
    t = i / FPS; bgi = min(max(i - OFF, 0), len(frames) - 1)
    bg = frames[bgi].astype(np.float32); scr = screen_at(t)
    out = push(bg * (1 - mask_s) + scr * mask_s, t)
    if i == 0: start_frame = out.copy()
    if t >= T_END - FADE:
        k = (t - (T_END - FADE)) / FADE; k = k * k * (3 - 2 * k); out = out * (1 - k) + start_frame * k
    proc.stdin.write(out.clip(0, 255).astype(np.uint8).tobytes())
proc.stdin.close(); proc.wait()
cv2.imwrite(out_p.replace('.mp4', '-start.png'), start_frame.clip(0, 255).astype(np.uint8))
mid = int((T_DONE + 0.5) * FPS); bgi = min(max(mid - OFF, 0), len(frames) - 1)
cv2.imwrite(out_p.replace('.mp4', '-done.png'), (frames[bgi].astype(np.float32) * (1 - mask_s) + screen_at(T_DONE + 0.5) * mask_s).clip(0, 255).astype(np.uint8))
print('frames', N, 'clip frames', len(frames))
