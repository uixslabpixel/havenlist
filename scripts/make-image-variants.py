#!/usr/bin/env python3
"""Make the smaller WebP copies that the pages pick with srcset (run from the repo root: python3 scripts/make-image-variants.py).
   name.webp stays the full-size file; name-480.webp / name-640.webp / name-960.webp are down-scaled copies.
   Only files that are missing or older than their source are rewritten."""
import glob, os, re
from PIL import Image

JOBS = [
    ("assets/hero-back.webp", [640, 960]),
    ("assets/hero-front.webp", [640, 960]),
    ("assets/featured-?.webp", [640, 960]),
    ("assets/listings/listing-*.webp", [480]),
    ("assets/testimonials/photo-?.webp", [360]),
    ("assets/footer-bg.webp", [800, 1200]),
    ("assets/sell/hero-left.webp", [640, 960]),
    ("assets/sell/hero-right.webp", [640, 960]),
    ("assets/sell/how-1.webp", [640]),
    ("assets/about/hero.webp", [640, 1100]),
    ("assets/neighborhoods/hero-pacific-heights.webp", [640, 960]),
    ("assets/agents/agent-*.webp", [320]),
]

def done(src, dst):
    return os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)

for pattern, widths in JOBS:
    for src in sorted(glob.glob(pattern)):
        stem = src[:-5]
        if re.search(r"-(320|360|480|640|800|960|1100|1200)$", stem):
            continue  # skip existing variants
        im = Image.open(src)
        for w in widths:
            if w >= im.width:
                continue
            dst = f"{stem}-{w}.webp"
            if done(src, dst):
                continue
            h = round(im.height * w / im.width)
            im.convert("RGB").resize((w, h), Image.LANCZOS).save(dst, "WEBP", quality=80, method=6)
            print(dst, f"{os.path.getsize(dst)//1024}KB")
