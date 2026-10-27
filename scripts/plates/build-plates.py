import cv2, numpy as np, json
from PIL import Image
from platelib import *

def face_bbox(rgb):
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    m = (g > 150).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    i = 1 + np.argmax(st[1:, 4]); x, y, w, h, _ = st[i]
    return int(x), int(y), int(w), int(h)

def ref_glyphs(name, thr=100, min_area=40):
    rgb = load(f'{name}.png'); fx, fy, fw, fh = face_bbox(rgb)
    face = rgb[fy:fy + fh, fx:fx + fw]
    m = mask_black(face, thr)
    cs = [c for c in components(m, min_area) if c['w'] < 0.6 * fw and c['h'] < 0.95 * fh]
    return face, m, cs, (fw, fh)

lib = {}
# Digit font: Abu Dhabi 42985 and 30214 (same federal digit cut as the Defender's plate)
face4, m4, c4, s4 = ref_glyphs('ref04')
tall4 = [c for c in c4 if c['h'] > 0.45 * s4[1] and c['x'] > 0.38 * s4[0]]
print('ref04 digits', len(tall4), [c['x'] for c in tall4])
for ch, c in zip('42985', tall4): lib[ch] = c
face6, m6, c6, s6 = ref_glyphs('ref06')
tall6 = [c for c in c6 if c['h'] > 0.45 * s6[1] and c['x'] > 0.3 * s6[0]]
print('ref06 digits', len(tall6), [c['x'] for c in tall6])
for ch, c in zip('30214', tall6): lib['r6' + ch] = c
lib['3'] = lib['r63']; lib['0'] = lib['r60']; lib['1'] = lib['r61']
face7, m7, c7, s7 = ref_glyphs('ref07')
tall7 = [c for c in c7 if c['h'] > 0.45 * s7[1] and c['x'] > 0.45 * s7[0]]
print('ref07 digits', len(tall7))
for ch, c in zip('1986', tall7): lib['r7' + ch] = c
lib['6'] = lib['r76']
face2, m2, c2, s2 = ref_glyphs('ref02', thr=90)
tall2 = [c for c in c2 if c['h'] > 0.45 * s2[1] and c['x'] > 0.45 * s2[0]]
print('ref02 digits', len(tall2), [(c['w'], c['h']) for c in tall2])
for ch, c in zip('12345', tall2): lib['r2' + ch] = c
print('aspect ref07 9/8', [(k, round(lib[k]['w']/lib[k]['h'],2)) for k in ['r79','r78']], 'ref02', [(k, round(lib[k]['w']/lib[k]['h'],2)) for k in ['r23','r25']], 'ref04', [(k, round(lib[k]['w']/lib[k]['h'],2)) for k in ['9','5','8']])

# ---- Dubai: layout measured on the rectified Defender plate (face 992 x 207) ----
W, H = 992, 207
face = load('face.png'); fm = mask_black(face, 110)
fc = components(fm, 60)
def pick(cs, x0, x1, y0, y1): return [c for c in cs if x0 <= c['x'] < x1 and y0 <= c['y'] < y1]
photo_digits = [c for c in fc if c['h'] > 120 and c['x'] > 400 and c['w'] < 100]
print('photo digits', [(c['x'], c['w']) for c in photo_digits])
photo_M = pick(fc, 90, 170, 100, 120)[0]
# Wordmark: the clean "DUBAI" from reference 03 (classic plate, same design)
face3, m3, c3, s3 = ref_glyphs('ref03', thr=90)
wm = merge([c for c in c3 if c['y'] + c['h'] < 0.45 * s3[1] and c['x'] < 0.45 * s3[0] and c['area'] > 100])
print('wordmark ref03', wm['x'], wm['y'], wm['w'], wm['h'], 'of', s3)
wm_box = (53, 19, 167, 64)   # measured on the photo
body = paths_el(glyph_paths(wm, wm_box, fit='width', sigma=1.2, eps=0.5))
body += paths_el(glyph_paths(photo_M, (97, 106, 66, 90), sigma=2.5, eps=2.2))
narrow = {'9': 'r79', '8': 'r78', '3': 'r23', '5': 'r25'}  # narrow federal cut, as on the Defender's plate
print('photo digit aspects', [(ch, round(c['w']/c['h'],2)) for ch, c in zip('95378', photo_digits)])
for ch, c in zip('95378', photo_digits):
    # every digit is the plate's own glyph (narrow federal cut), smoothed and regularised
    body += paths_el(glyph_paths(c, (c['x'], c['y'], c['w'], c['h']), sigma=2.2, eps=1.4))
open('dubai.svg', 'w').write(svg(W, H, body, radius=10, bw=6))

# ---- Abu Dhabi: reference 04 as is (black + red layers) ----
rgb = load('ref04.png'); fx, fy, fw, fh = face_bbox(rgb); f = rgb[fy:fy + fh, fx:fx + fw]
mb = mask_black(f, 100); mr = mask_red(f)
mb = cv2.bitwise_and(mb, cv2.bitwise_not(cv2.dilate(mr, np.ones((3, 3), np.uint8))))
# drop the plate border ring
keep = np.zeros_like(mb)
for c in components(mb, 15):
    if c['w'] < 0.6 * fw and c['h'] < 0.9 * fh: keep[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']] |= c['mask']
S = 992 / fw
body = paths_el(contours_to_paths(keep, sigma=1.2, eps=0.5, scale=S)) + paths_el(contours_to_paths(mr, sigma=1.2, eps=0.5, scale=S), fill='#c8102e')
open('abudhabi.svg', 'w').write(svg(992, round(fh * S), body, radius=10, bw=5))

# ---- Fujairah: reference 07 (black layer) ----
rgb = load('ref07.png'); fx, fy, fw, fh = face_bbox(rgb); f = rgb[fy:fy + fh, fx:fx + fw]
mb = mask_black(f, 100); keep = np.zeros_like(mb)
for c in components(mb, 10):
    if c['w'] < 0.6 * fw and c['h'] < 0.9 * fh: keep[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']] |= c['mask']
S = 992 / fw
open('fujairah.svg', 'w').write(svg(992, round(fh * S), paths_el(contours_to_paths(keep, sigma=1.2, eps=0.5, scale=S)), radius=10, bw=5))

# ---- Sharjah: reference 01 text; the watermarked grey digits rebuilt from the digit font ----
rgb = load('ref01.png'); fx, fy, fw, fh = face_bbox(rgb); f = rgb[fy:fy + fh, fx:fx + fw]
mb = mask_black(f, 90); keep = np.zeros_like(mb)
for c in components(mb, 10):
    if c['w'] < 0.6 * fw and c['h'] < 0.9 * fh: keep[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']] |= c['mask']
S = 992 / fw
body = paths_el(contours_to_paths(keep, sigma=1.2, eps=0.5, scale=S))
greys = [c for c in components(mask_grey(f, 120, 215), 200) if c['h'] > 0.35 * fh and c['w'] < 0.3 * fw]
print('sharjah grey digits', [(c['x'], c['w'], c['h']) for c in greys])
for ch, c in zip('112345', greys):
    body += paths_el(glyph_paths(lib[ch], (c['x'] * S, c['y'] * S, c['w'] * S, c['h'] * S), sigma=1.2, eps=0.5))
open('sharjah.svg', 'w').write(svg(992, round(fh * S), body, radius=10, bw=6))
for n in ['dubai', 'abudhabi', 'sharjah', 'fujairah']: print(n, len(open(n + '.svg').read()), 'bytes')
