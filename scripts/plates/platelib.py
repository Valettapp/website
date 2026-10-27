"""Vectorise plate artwork: masks → smooth contours → SVG path data. All coordinates in source px."""
import cv2, numpy as np
from PIL import Image

UP = 4  # upscale factor before contouring

def load(path):
    return np.array(Image.open(path).convert('RGB'))

def mask_black(rgb, thr=100):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    return (g < thr).astype(np.uint8) * 255

def mask_grey(rgb, lo=120, hi=215):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    s = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)[..., 1]
    return ((g > lo) & (g < hi) & (s < 40)).astype(np.uint8) * 255

def mask_red(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    return (((h < 12) | (h > 160)) & (s > 90) & (v > 70)).astype(np.uint8) * 255

def upscale(mask, up=UP):
    big = cv2.resize(mask, None, fx=up, fy=up, interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (0, 0), up * 0.6)
    return (big > 127).astype(np.uint8) * 255

def smooth_closed(pts, sigma):
    """Gaussian smoothing along a closed polyline (N,2)."""
    if len(pts) < 8 or sigma <= 0: return pts
    k = int(sigma * 3) * 2 + 1
    ker = cv2.getGaussianKernel(k, sigma).ravel()
    out = np.empty_like(pts, dtype=np.float64)
    for d in range(2):
        col = pts[:, d].astype(np.float64)
        pad = np.concatenate([col[-(k // 2):], col, col[:k // 2]])
        out[:, d] = np.convolve(pad, ker, mode='valid')
    return out

def contours_to_paths(mask, up=UP, sigma=1.5, eps=0.6, min_area=0, offset=(0, 0), scale=1.0):
    """Returns one SVG path 'd' (even-odd) for every outer contour with its holes."""
    big = upscale(mask, up)
    cs, hier = cv2.findContours(big, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    if hier is None: return []
    hier = hier[0]
    def d_of(c):
        p = c.reshape(-1, 2).astype(np.float64)
        p = smooth_closed(p, sigma * up / 2)
        p = cv2.approxPolyDP(p.astype(np.float32).reshape(-1, 1, 2), eps * up / 2, True).reshape(-1, 2)
        p = (p / up) * scale
        p[:, 0] += offset[0]; p[:, 1] += offset[1]
        return 'M' + ' '.join(f'{x:.2f} {y:.2f}' for x, y in p) + 'Z'
    paths = []
    for i, c in enumerate(cs):
        if hier[i][3] != -1: continue  # hole: handled with its parent
        if cv2.contourArea(c) < min_area * up * up: continue
        d = d_of(c)
        child = hier[i][2]
        while child != -1:
            if cv2.contourArea(cs[child]) >= 4 * up * up: d += d_of(cs[child])
            child = hier[child][0]
        paths.append(d)
    return paths

def components(mask, min_area=20):
    """Connected components as dicts {x,y,w,h,area,mask}, sorted by x."""
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    out = []
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        if a < min_area: continue
        m = ((lab == i) * 255).astype(np.uint8)[y:y + h, x:x + w]
        out.append(dict(x=int(x), y=int(y), w=int(w), h=int(h), area=int(a), mask=m))
    return sorted(out, key=lambda c: c['x'])

def merge(comps):
    """Union of components into one glyph dict (for multi-part glyphs)."""
    x0 = min(c['x'] for c in comps); y0 = min(c['y'] for c in comps)
    x1 = max(c['x'] + c['w'] for c in comps); y1 = max(c['y'] + c['h'] for c in comps)
    m = np.zeros((y1 - y0, x1 - x0), np.uint8)
    for c in comps:
        m[c['y'] - y0:c['y'] - y0 + c['h'], c['x'] - x0:c['x'] - x0 + c['w']] |= c['mask']
    return dict(x=x0, y=y0, w=x1 - x0, h=y1 - y0, area=sum(c['area'] for c in comps), mask=m)

def glyph_paths(glyph, box, fit='height', **kw):
    """Vectorise a glyph mask and place it into box=(x,y,w,h) in plate units, scaled by height (or width)."""
    gx, gy, gw, gh = glyph['x'], glyph['y'], glyph['w'], glyph['h']
    bx, by, bw, bh = box
    s = bh / gh if fit == 'height' else bw / gw
    # centre horizontally in the box
    ox = bx + (bw - gw * s) / 2 if fit == 'height' else bx
    oy = by + (bh - gh * s) / 2 if fit == 'width' else by
    return contours_to_paths(glyph['mask'], offset=(ox, oy), scale=s, **kw)

def svg(width, height, body, radius=None, face='#ffffff', border='#0a0a0a', bw=None):
    r = radius if radius is not None else height * 0.06
    bw = bw if bw is not None else height * 0.03
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">'
            f'<rect x="{bw/2}" y="{bw/2}" width="{width-bw}" height="{height-bw}" rx="{r}" fill="{face}" stroke="{border}" stroke-width="{bw}"/>'
            + body + '</svg>')

def paths_el(paths, fill='#0a0a0a'):
    return ''.join(f'<path d="{d}" fill="{fill}" fill-rule="evenodd"/>' for d in paths)
