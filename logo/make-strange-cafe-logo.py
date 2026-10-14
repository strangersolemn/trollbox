#!/usr/bin/env python3
"""Draws the STRANGE CAFÉ wordmark in the TROLLBOX logo style (red brush caps, thick wobbly black
outline + offset shadow, grey object with the troll eye). Output: logo/strange-cafe-logo.png (stacked)
and logo/strange-cafe-logo-wide.png (one line). Run: python3 logo/make-strange-cafe-logo.py [seed]"""
import math, random, sys, pathlib
from PIL import Image, ImageDraw, ImageFilter, ImageChops
HERE = pathlib.Path(__file__).parent
RED, GREY, BLACK, WHITE = (176, 59, 75, 255), (115, 114, 114, 255), (0, 0, 0, 255), (255, 255, 255, 255)
SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 7

def cr(pts, n=10):   # Catmull-Rom through the points
    if len(pts) < 3: return pts
    p = [pts[0]] + pts + [pts[-1]]; out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for k in range(n):
            t = k / n; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(pts[-1]); return out

# letter skeletons: list of strokes, each ("l"ine or "c"urve, points) in a box 0..w × 0..1 (y down)
L = {
 "S": (0.74, [("c", [(0.70, 0.13), (0.40, 0.0), (0.08, 0.14), (0.10, 0.38), (0.40, 0.50), (0.68, 0.64), (0.68, 0.88), (0.38, 1.0), (0.05, 0.86)])]),
 "T": (0.86, [("l", [(0.0, 0.03), (0.86, 0.0)]), ("l", [(0.43, 0.01), (0.45, 1.0)])]),
 "R": (0.78, [("l", [(0.02, 1.0), (0.0, 0.0)]), ("c", [(0.0, 0.0), (0.50, 0.0), (0.72, 0.15), (0.70, 0.36), (0.45, 0.50), (0.02, 0.50)]), ("l", [(0.38, 0.50), (0.78, 1.0)])]),
 "A": (0.84, [("l", [(0.0, 1.0), (0.42, 0.0), (0.84, 1.0)]), ("l", [(0.19, 0.62), (0.66, 0.62)])]),
 "N": (0.80, [("l", [(0.0, 1.0), (0.02, 0.0), (0.78, 1.0), (0.80, 0.0)])]),
 "G": (0.82, [("c", [(0.76, 0.14), (0.44, 0.0), (0.10, 0.18), (0.02, 0.55), (0.22, 0.94), (0.58, 1.0), (0.80, 0.80), (0.80, 0.56)]), ("l", [(0.80, 0.56), (0.46, 0.56)])]),
 "E": (0.66, [("l", [(0.66, 0.0), (0.0, 0.02), (0.02, 1.0), (0.66, 0.98)]), ("l", [(0.01, 0.50), (0.52, 0.49)])]),
 "C": (0.74, [("c", [(0.72, 0.14), (0.40, 0.0), (0.06, 0.24), (0.04, 0.70), (0.36, 1.0), (0.74, 0.86)])]),
 "F": (0.64, [("l", [(0.64, 0.0), (0.0, 0.02), (0.02, 1.0)]), ("l", [(0.01, 0.50), (0.50, 0.49)])]),
 "É": (0.66, [("l", [(0.66, 0.0), (0.0, 0.02), (0.02, 1.0), (0.66, 0.98)]), ("l", [(0.01, 0.50), (0.52, 0.49)]), ("l", [(0.20, -0.12), (0.50, -0.32)])]),
}

def layout(word, x0, y0, H, gap=0.20):
    strokes, x = [], x0
    for ch in word:
        w, ss = L[ch]
        for kind, pts in ss:
            P = [(x + px * H, y0 + py * H) for px, py in pts]
            strokes.append(cr(P, 14) if kind == "c" else P)
        x += (w + gap) * H
    return strokes, x

def densify(pts, step):
    out = []
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
        out += [(x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n) for k in range(n)]
    return out + [pts[-1]]

def wobble(pts, amp, rnd):
    ph, f = rnd.uniform(0, 6.28), rnd.uniform(0.02, 0.05)
    return [(x + math.sin(i * f + ph) * amp + rnd.uniform(-amp, amp) * 0.35, y + math.cos(i * f * 1.3 + ph) * amp + rnd.uniform(-amp, amp) * 0.35) for i, (x, y) in enumerate(pts)]

def brush(d, pts, width, color, rnd, amp):
    P = wobble(densify(pts, 4), amp, rnd)
    for i, (x, y) in enumerate(P):   # a dab every step, width breathes a little
        r = width / 2 * (0.92 + 0.12 * math.sin(i * 0.11 + width))
        d.ellipse((x - r, y - r, x + r, y + r), fill=color)

def mug(d, x, y, H, rnd):
    """grey mug (stands in for TROLLBOX's CRT) with the troll eye, plus steam"""
    w, h = 0.78 * H, 0.86 * H
    body = [(x, y + 0.10 * H), (x + w, y + 0.10 * H), (x + w * 0.94, y + h), (x + w * 0.06, y + h)]
    d.polygon([(px + 14, py + 14) for px, py in body], fill=BLACK)                                   # shadow
    d.ellipse((x + w * 0.80, y + 0.28 * H, x + w * 1.30, y + 0.74 * H), outline=BLACK, width=int(0.17 * H))   # handle
    d.ellipse((x + w * 0.85, y + 0.33 * H, x + w * 1.25, y + 0.69 * H), outline=GREY, width=int(0.07 * H))
    d.polygon(body, fill=BLACK)
    inset = 0.06 * H
    d.polygon([(x + inset, y + 0.10 * H + inset), (x + w - inset, y + 0.10 * H + inset), (x + w * 0.94 - inset, y + h - inset), (x + w * 0.06 + inset, y + h - inset)], fill=GREY)
    d.rectangle((x + inset, y + 0.10 * H + inset, x + w - inset, y + 0.22 * H), fill=RED)            # the drink (red, like the CRT screen)
    cx, cy = x + w / 2, y + 0.55 * H
    d.ellipse((cx - 0.21 * H, cy - 0.27 * H, cx + 0.19 * H, cy + 0.25 * H), fill=BLACK)
    d.ellipse((cx - 0.18 * H, cy - 0.24 * H, cx + 0.16 * H, cy + 0.22 * H), fill=WHITE)
    d.ellipse((cx - 0.09 * H, cy - 0.17 * H, cx + 0.17 * H, cy + 0.15 * H), fill=BLACK)
    d.ellipse((cx + 0.02 * H, cy - 0.08 * H, cx + 0.12 * H, cy + 0.03 * H), fill=WHITE)
    d.ellipse((cx + 0.045 * H, cy - 0.055 * H, cx + 0.095 * H, cy + 0.005 * H), fill=BLACK)
    for k, sx in enumerate((0.28, 0.56)):   # steam
        pts = [(x + sx * w + math.sin(t / 3) * 0.06 * H, y + 0.02 * H - t * 0.045 * H) for t in range(9)]
        brush(d, pts, 0.07 * H, BLACK, rnd, 1.5)

def render(lines, out, H=260, mug_after=None):
    rnd = random.Random(SEED)
    W = int(max(sum(L[c][0] + 0.20 for c in ln) for ln in lines) * H + (1.4 * H if mug_after is not None else 0) + 0.8 * H)
    Ht = int(len(lines) * H * 1.55 + 0.7 * H)
    shadow, outline, fill = (Image.new("RGBA", (W, Ht), (0, 0, 0, 0)) for _ in range(3))
    ds, do, df = ImageDraw.Draw(shadow), ImageDraw.Draw(outline), ImageDraw.Draw(fill)
    objs = Image.new("RGBA", (W, Ht), (0, 0, 0, 0)); dm = ImageDraw.Draw(objs)
    y = 0.45 * H
    for li, ln in enumerate(lines):
        lw = sum(L[c][0] + 0.20 for c in ln) * H + (1.1 * H if mug_after == li else 0)
        strokes, xend = layout(ln, 0.4 * H + (W - 0.8 * H - lw - (1.4 * H if mug_after is not None else 0)) / 2 + (0.7 * H if mug_after is not None and mug_after != li else 0), y, H)
        for s in strokes:
            brush(ds, [(px + 0.05 * H, py + 0.06 * H) for px, py in s], 0.24 * H, BLACK, rnd, 6)   # offset shadow
            brush(do, s, 0.21 * H, BLACK, rnd, 6)                                                 # outline
            brush(do, s, 0.19 * H, BLACK, rnd, 9)                                                 # rough second pass
            brush(df, s, 0.105 * H, RED, rnd, 4)                                                  # the red paint
        if mug_after == li: mug(dm, xend + 0.05 * H, y + 0.06 * H, H, rnd)
        y += H * 1.55
    # brush texture: darker flecks in the red, ragged black edges
    noise = Image.effect_noise((W, Ht), 60).convert("L").filter(ImageFilter.GaussianBlur(1.2))
    streak = noise.point(lambda v: 255 if v > 168 else 0)
    dark = Image.new("RGBA", (W, Ht), (120, 36, 50, 255))
    fill = Image.composite(dark, fill, ImageChops.multiply(streak, fill.split()[3]))
    rag = noise.point(lambda v: 0 if v > 205 else 255)
    outline.putalpha(ImageChops.multiply(outline.split()[3], rag.filter(ImageFilter.MaxFilter(3))))
    img = Image.new("RGBA", (W, Ht), (0, 0, 0, 0))
    for layer in (shadow, outline, fill, objs): img = Image.alpha_composite(img, layer)
    img = img.crop(img.getbbox()); pad = 24
    final = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0)); final.paste(img, (pad, pad), img)
    final.save(out); print(out, final.size)

render(["STRANGE", "CAFÉ"], HERE / "strange-cafe-logo-draft.png", mug_after=1)
render(["STRANGECAFÉ"[:7]], HERE / "_tmp.png")   # (warm-up keeps the rng sequence stable)
rnd_lines = ["STRANGE", "CAFÉ"]
# one-line version: STRANGE CAFÉ + mug
def render_wide():
    global L
    L[" "] = (0.25, [])
    render(["STRANGE CAFÉ"], HERE / "strange-cafe-logo-draft-wide.png", mug_after=0)
render_wide()
(HERE / "_tmp.png").unlink()
