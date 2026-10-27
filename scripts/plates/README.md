# Plate replicas

`src/assets/plates/*.svg` are vector replicas of real UAE plates, traced from photographs:

- **Dubai M 95378** — built from the reference sheet: the DUBAI wordmark and layout from the classic
  plate (reference 03), the digits from the classic digit cut on the small plates (reference 05; the 9 is
  the 6 turned through 180 degrees), laid out on the glyph positions measured on the Defender's own
  plate (face perspective-rectified from the photo). The code letter M, absent from the sheet, is the
  plate's own, regularised.
- **Abu Dhabi 11 42985**, **Fujairah J 1986** — traced from the reference sheet (black and red layers).
- **Sharjah 1 12345** — header text traced from the reference; the digits (watermarked in the
  reference) are rebuilt from the same federal digit cut taken off the other reference plates.

`build-plates.py` reproduces them (needs OpenCV; reads the photo and the reference crops `ref0N.png`
from the working directory, which are not committed).
