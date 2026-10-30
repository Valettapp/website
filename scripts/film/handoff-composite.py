# Put the real app screens onto the two blank phones in a still.
# usage: composite.py photo.png out.png left_screen.png right_screen.png
import sys, cv2, numpy as np
photo, out, uiL, uiR = sys.argv[1:5]
img = cv2.imread(photo); H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
dark = (hsv[..., 2] < 45).astype(np.uint8)
dark = cv2.morphologyEx(dark, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
comps = sorted(range(1, n), key=lambda i: -st[i, cv2.CC_STAT_AREA])[:2]
comps = sorted(comps, key=lambda i: st[i, cv2.CC_STAT_LEFT])
def side_line(pts):  # fit x = a*y + b or y = a*x + b
    vx, vy, x0, y0 = cv2.fitLine(pts.astype(np.float32), cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
    return np.array([x0, y0]), np.array([vx, vy])
def inter(l1, l2):
    (p, d), (q, e) = l1, l2
    A = np.array([d, -e]).T; t = np.linalg.solve(A, q - p); return p + t[0] * d
def quad(mask):
    ys, xs = np.nonzero(mask); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    h, w = y1 - y0, x1 - x0
    L, R, T, B = [], [], [], []
    for y in range(int(y0 + .2 * h), int(y1 - .2 * h), 2):
        row = np.nonzero(mask[y])[0]; L.append((row.min(), y)); R.append((row.max(), y))
    for x in range(int(x0 + .25 * w), int(x1 - .25 * w), 2):
        col = np.nonzero(mask[:, x])[0]; T.append((x, col.min())); B.append((x, col.max()))
    l, r, t, b = [side_line(np.array(v)) for v in (L, R, T, B)]
    return np.array([inter(t, l), inter(t, r), inter(b, r), inter(b, l)], np.float32)
res = img.astype(np.float32)
for i, uip in zip(comps, (uiL, uiR)):
    m = (lab == i).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    m = cv2.dilate(m, np.ones((3, 3), np.uint8))  # cover the anti-aliased edge
    q = quad(m)
    c = q.mean(0); qi = c + (q - c) * (1 - 0.030)  # bezel inset
    qi[2:, 1] += 0.007 * (q[3][1] - q[0][1])  # even out the bottom bezel
    ui = cv2.imread(uip); uh, uw = ui.shape[:2]
    qw = (np.linalg.norm(qi[1] - qi[0]) + np.linalg.norm(qi[2] - qi[3])) / 2
    qh = (np.linalg.norm(qi[3] - qi[0]) + np.linalg.norm(qi[2] - qi[1])) / 2
    target = qw / qh
    if uw / uh > target:  # too wide: trim sides
        nw = round(uh * target); ui = ui[:, (uw - nw) // 2:(uw - nw) // 2 + nw]
    else:  # too tall: trim the quiet middle-bottom
        nh = round(uw / target); ui = np.vstack([ui[:int(uh * .62)], ui[int(uh * .62) + (uh - nh):]])
    uh, uw = ui.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [uw, 0], [uw, uh], [0, uh]]), qi)
    warp = cv2.warpPerspective(ui, M, (W, H), flags=cv2.INTER_AREA).astype(np.float32)
    # display mask: the glass shape shrunk to the inset, rounded corners kept, soft 1.5 px edge
    inner = cv2.warpPerspective(np.full((uh, uw), 255, np.uint8), M, (W, H))
    r = int(qw * 0.12)
    glass = cv2.erode(m * 255, np.ones((3, 3), np.uint8), iterations=max(1, int(qw * 0.030 / 2)))
    mask = cv2.GaussianBlur(np.minimum(inner, glass).astype(np.float32) / 255, (0, 0), 1.2)[..., None]
    # faint glass sheen, top-left to bottom-right
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    g = ((xx - q[0][0]) / qw + (yy - q[0][1]) / qh) / 2
    sheen = np.clip(0.06 * (1 - np.abs(g - 0.35) / 0.35), 0, None)[..., None]
    comp = warp * (1 - sheen) + 255 * sheen
    res = res * (1 - mask) + comp * mask
    print('phone', i, 'quad', q.round(1).tolist(), 'aspect', round(target, 4))
cv2.imwrite(out, np.clip(res, 0, 255).astype(np.uint8))
