# Request My Car loop: Kling clip (car drives in, phone screen black) + the real guest screens laid onto the
# phone frame by frame: Request My Car -> tap -> Request received -> Bringing your car -> hold -> dissolve back.
# usage: request.py clip.mp4 start.png end.png out.mp4
import sys, cv2, numpy as np, subprocess
clip, start_p, end_p, out_p = sys.argv[1:5]
D = sys.path[0]
W, H, FPS = 1920, 1080, 30

def quad_of_phone(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV); h, w = img.shape[:2]
    dark = (hsv[..., 2] < 45).astype(np.uint8); dark[:, w // 2:] = 0
    dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
    i = max(range(1, n), key=lambda k: st[k, cv2.CC_STAT_AREA])
    m = cv2.morphologyEx((lab == i).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    m = cv2.dilate(m, np.ones((3, 3), np.uint8))
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max(); hh, ww = y1 - y0, x1 - x0
    def fit(pts):
        vx, vy, px, py = cv2.fitLine(np.float32(pts), cv2.DIST_HUBER, 0, .01, .01).ravel(); return np.array([px, py]), np.array([vx, vy])
    def inter(a, b):
        (p, d), (q, e) = a, b; t = np.linalg.solve(np.array([d, -e]).T, q - p); return p + t[0] * d
    L, R, T, B = [], [], [], []
    for y in range(int(y0 + .2 * hh), int(y1 - .2 * hh), 2):
        r = np.nonzero(m[y])[0]; L.append((r.min(), y)); R.append((r.max(), y))
    for x in range(int(x0 + .25 * ww), int(x1 - .25 * ww), 2):
        c = np.nonzero(m[:, x])[0]; T.append((x, c.min())); B.append((x, c.max()))
    l, r, t, b = map(fit, (L, R, T, B))
    return np.float32([inter(t, l), inter(t, r), inter(b, r), inter(b, l)]), m

end = cv2.resize(cv2.imread(end_p), (W, H), interpolation=cv2.INTER_AREA)
start = cv2.resize(cv2.imread(start_p), (W, H), interpolation=cv2.INTER_AREA)
q, glass = quad_of_phone(end)
c = q.mean(0); qi = c + (q - c) * (1 - 0.030); qi[2:, 1] += 0.007 * (q[3][1] - q[0][1])
qw = (np.linalg.norm(qi[1] - qi[0]) + np.linalg.norm(qi[2] - qi[3])) / 2
qh = (np.linalg.norm(qi[3] - qi[0]) + np.linalg.norm(qi[2] - qi[1])) / 2
target = qw / qh

def fit_ui(ui):
    uh, uw = ui.shape[:2]
    if uw / uh > target:
        nw = round(uh * target); return ui[:, (uw - nw) // 2:(uw - nw) // 2 + nw]
    nh = round(uw / target); return np.vstack([ui[:int(uh * .62)], ui[int(uh * .62) + (uh - nh):]])

def tap(ui, k):  # darken the Request My Car button and draw a soft ripple; k in 0..1
    ui = ui.copy().astype(np.float32); uh, uw = ui.shape[:2]
    cy = int(uh * 0.787); cx = uw // 2
    ov = ui.copy(); cv2.circle(ov, (cx, cy), int(uw * (0.05 + 0.35 * k)), (255, 255, 255), -1)
    a = 0.28 * (1 - k); ui = ui * (1 - a) + ov * a
    return ui.clip(0, 255).astype(np.uint8)

M = None; mask = None
def warp(ui):
    global M, mask
    ui = fit_ui(ui); uh, uw = ui.shape[:2]
    Mx = cv2.getPerspectiveTransform(np.float32([[0, 0], [uw, 0], [uw, uh], [0, uh]]), qi)
    if mask is None:
        inner = cv2.warpPerspective(np.full((uh, uw), 255, np.uint8), Mx, (W, H))
        gl = cv2.erode(glass * 255, np.ones((3, 3), np.uint8), iterations=max(1, int(qw * .015)))
        mask = cv2.GaussianBlur(np.minimum(inner, gl).astype(np.float32) / 255, (0, 0), 1.2)[..., None]
    w = cv2.warpPerspective(ui, Mx, (W, H), flags=cv2.INTER_AREA).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    g = ((xx - q[0][0]) / qw + (yy - q[0][1]) / qh) / 2
    sh = np.clip(0.06 * (1 - np.abs(g - 0.35) / 0.35), 0, None)[..., None]
    return w * (1 - sh) + 255 * sh

S1 = cv2.imread(f'{D}/screen-guest-1.png'); S3 = cv2.imread(f'{D}/screen-guest-3.png'); S4 = cv2.imread(f'{D}/screen-guest-4.png')
w1, w3, w4 = warp(S1), warp(S3), warp(S4)
taps = [warp(tap(S1, k / 6)) for k in range(7)]

# read the clip at 30 fps, 1920x1080
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', clip, '-vf', f'scale={W}:{H}:flags=lanczos,fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
# Clean Kling's background drift: keep the car (and a soft margin for its shadow), use the clean studio floor
# everywhere else right of the phone.
B = start.astype(np.float32)
x_cut = int(q[:, 0].max()) + 40
side = np.zeros((H, W, 1), np.float32); side[:, x_cut:] = 1
side = cv2.GaussianBlur(side, (0, 0), 15)[..., None] if side.ndim == 2 else cv2.GaussianBlur(side[..., 0], (0, 0), 15)[..., None]
clean = []
for f in frames:
    ff = f.astype(np.float32)
    car = (np.abs(ff - B).max(2) > 22).astype(np.uint8)
    car = cv2.morphologyEx(car, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    car = cv2.dilate(car, np.ones((71, 71), np.uint8)).astype(np.float32)
    car = cv2.GaussianBlur(car, (0, 0), 25)[..., None]
    k = side * (1 - car)          # how much clean background to use
    clean.append((ff * (1 - k) + B * k).clip(0, 255).astype(np.uint8))
frames = np.stack(clean)
# when does the car enter / stop? motion in the right half
right = [f[:, W // 2:].astype(np.int16) for f in frames]
mot = [0] + [float(np.abs(right[i] - right[i - 1]).mean()) for i in range(1, len(frames))]
moving = [i for i, v in enumerate(mot) if v > 0.6]
enter, stop = (moving[0], moving[-1]) if moving else (len(frames) // 3, len(frames) - 1)
print('car enters at', enter / FPS, 's, stops at', stop / FPS, 's of', len(frames) / FPS)

PRE = int(1.4 * FPS)           # hold on the start before Kling's clip so the tap reads
HOLD = int(2.6 * FPS); FADE = int(0.7 * FPS)
seq = [start] * PRE + list(frames) + [frames[-1]] * HOLD
n = len(seq)
t_tap = int(0.5 * FPS); t_req = t_tap + 7; t_bring = PRE + max(enter - 4, 0)
proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', out_p], stdin=subprocess.PIPE)
def screen_at(i):
    if i < t_tap: return w1
    if i < t_tap + 7: return taps[i - t_tap]
    if i < t_req + 6:  # crossfade to request received
        k = (i - t_req) / 6; return w1 * (1 - k) + w3 * k if i >= t_req else taps[-1]
    if i < t_bring: return w3
    if i < t_bring + 8:
        k = (i - t_bring) / 8; return w3 * (1 - k) + w4 * k
    return w4
first = (start.astype(np.float32) * (1 - mask) + w1 * mask)
for i in range(n):
    f = seq[i].astype(np.float32)
    out = f * (1 - mask) + screen_at(i) * mask
    if i >= n - FADE:  # dissolve back to the opening frame so it loops
        k = (i - (n - FADE)) / FADE; k = k * k * (3 - 2 * k); out = out * (1 - k) + first * k
    proc.stdin.write(out.clip(0, 255).astype(np.uint8).tobytes())
proc.stdin.close(); proc.wait()
cv2.imwrite(out_p.replace('.mp4', '-start.png'), first.clip(0, 255).astype(np.uint8))
cv2.imwrite(out_p.replace('.mp4', '-end.png'), (frames[-1].astype(np.float32) * (1 - mask) + w4 * mask).clip(0, 255).astype(np.uint8))
print('frames', n, 'seconds', n / FPS)
