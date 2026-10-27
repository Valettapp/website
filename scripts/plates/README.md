# Plate replicas

`src/assets/plates/*.svg` are vector replicas of real UAE plates, traced from photographs:

- **Dubai M 95378** — the Defender's own plate. The face is perspective-rectified from the photo; the
  code letter and every digit are the plate's own glyphs, smoothed and regularised; the DUBAI wordmark
  is traced from the clean classic-plate reference (same design) because it is too small in the photo.
- **Abu Dhabi 11 42985**, **Fujairah J 1986** — traced from the reference sheet (black and red layers).
- **Sharjah 1 12345** — header text traced from the reference; the digits (watermarked in the
  reference) are rebuilt from the same federal digit cut taken off the other reference plates.

`build-plates.py` reproduces them (needs OpenCV; reads the photo and the reference crops `ref0N.png`
from the working directory, which are not committed).
