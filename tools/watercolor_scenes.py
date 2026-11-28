"""Original watercolor-style scene backgrounds for the lesson platform (no people or animals).
Layers are painted as transparent pigment washes (multiply), with pooled darker edges,
soft granulation and a paper texture, so they read like hand-painted watercolor."""
import numpy as np, math, sys, os
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

W, H = 1600, 900
RNG = np.random.default_rng(7)

def noise(scale, octaves=4, seed=None, shape=(H, W)):
    r = np.random.default_rng(seed if seed is not None else RNG.integers(1e9))
    out = np.zeros(shape, np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        s = max(2, int(scale * (2 ** o)))
        g = r.random((max(2, shape[0] * s // shape[1] + 2), s + 2)).astype(np.float32)
        z = ndi.zoom(g, (shape[0] / (g.shape[0] - 1), shape[1] / (g.shape[1] - 1)), order=3)[:shape[0], :shape[1]]
        out += z * amp; tot += amp; amp *= 0.5
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-6)

def hexrgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255

class Canvas:
    def __init__(self, paper='#fbf7ee'):
        self.img = np.ones((H, W, 3), np.float32) * hexrgb(paper)
        self.gran = noise(220, 2, seed=11)  # fine pigment granulation

    def mask(self):
        m = Image.new('L', (W, H), 0); return m, ImageDraw.Draw(m)

    def wash(self, m, color, alpha=.75, warp=10, soft=2.5, edge=.55, tex=.35, seed=None, grad=None, mode='mul'):
        """m: PIL L mask. Paint a transparent watercolor wash of `color` (multiply)."""
        a = np.asarray(m, np.float32) / 255
        if warp:
            n1 = noise(14, 3, seed=seed) - .5; n2 = noise(14, 3, seed=(seed or 0) + 99) - .5
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            a = ndi.map_coordinates(a, [yy + n1 * warp * 2, xx + n2 * warp * 2], order=1, mode='nearest')
        if soft: a = ndi.gaussian_filter(a, soft)
        # pooled pigment at the edges (watercolor rim)
        inner = ndi.gaussian_filter(a, 9)
        rim = np.clip(a - inner, 0, 1) * 2.2
        body = noise(5, 4, seed=(seed or 0) + 7)
        strength = alpha * (1 - tex + tex * body) * (0.85 + 0.3 * self.gran)
        if grad is not None: strength = strength * grad
        A = np.clip(a * strength + rim * edge * alpha, 0, 1)[..., None]
        c = hexrgb(color) if isinstance(color, str) else color
        if mode == 'over':
            # opaque-ish gouache layer: covers what is below, edge rim darker
            rimc = c * .78
            body_c = c * (0.94 + 0.12 * body[..., None])
            self.img = self.img * (1 - A) + body_c * A
            R = np.clip(rim * edge * alpha, 0, 1)[..., None]
            self.img = self.img * (1 - R * .6) + rimc * R * .6
        else:
            self.img = self.img * (1 - A * (1 - c))

    def lift(self, m, amount=.7, soft=18):
        """lift pigment back toward paper (clouds, highlights)"""
        a = ndi.gaussian_filter(np.asarray(m, np.float32) / 255, soft)[..., None] * amount
        paper = hexrgb('#fdfbf5')
        self.img = self.img * (1 - a) + paper * a

    def save(self, path):
        # paper texture + gentle vignette
        tex = noise(60, 3, seed=5)
        fib = noise(400, 1, seed=6)
        t = (0.965 + 0.035 * tex + 0.02 * (fib - .5))[..., None]
        yy, xx = np.mgrid[0:H, 0:W]
        v = 1 - 0.06 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        out = np.clip(self.img * t * v[..., None], 0, 1)
        Image.fromarray((out * 255).astype(np.uint8)).save(path, 'WEBP', quality=80, method=6)

def vgrad(top, bottom, y0=0, y1=H):
    g = np.clip((np.arange(H) - y0) / max(1, y1 - y0), 0, 1)[:, None] * np.ones((1, W))
    return top + (bottom - top) * g

# ---------- shape helpers ----------
def hills(d, base, amp, freq, phase, bottom=H):
    pts = [(0, bottom)]
    for x in range(0, W + 20, 20):
        y = base - amp * (0.6 * math.sin(x * freq + phase) + 0.4 * math.sin(x * freq * 2.3 + phase * 1.7))
        pts.append((x, y))
    pts.append((W, bottom)); d.polygon(pts, fill=255)

def blob(d, cx, cy, r, k=9, jitter=.22, seed=0):
    r_ = np.random.default_rng(seed)
    d.ellipse([cx - r * .8, cy - r * .75, cx + r * .8, cy + r * .75], fill=255)
    for i in range(k):
        t = i / k * 2 * math.pi + r_.random() * .4; rr = r * (.42 + .18 * r_.random())
        px, py = cx + r * .58 * math.cos(t), cy + r * .5 * math.sin(t)
        d.ellipse([px - rr, py - rr * .9, px + rr, py + rr * .9], fill=255)

def tree(c, x, ground, h, greens, trunk='#7a4b2a', seed=1, autumn=False):
    m, d = c.mask()
    d.polygon([(x - h * .045, ground), (x + h * .045, ground), (x + h * .025, ground - h * .55), (x - h * .025, ground - h * .55)], fill=255)
    d.line([(x, ground - h * .4), (x - h * .16, ground - h * .62)], fill=255, width=int(h * .028))
    d.line([(x, ground - h * .45), (x + h * .15, ground - h * .66)], fill=255, width=int(h * .025))
    c.wash(m, trunk, .8, warp=4, seed=seed)
    r_ = np.random.default_rng(seed)
    for layer, col in enumerate(greens):
        m, d = c.mask()
        for i in range(7):
            ang = r_.random() * 2 * math.pi; dist = h * (.05 + .17 * r_.random())
            blob(d, x + dist * math.cos(ang), ground - h * .74 + dist * .8 * math.sin(ang) - layer * h * .03,
                 h * (.2 - .03 * layer) * (0.7 + .5 * r_.random()), seed=seed * 10 + i + layer * 50)
        c.wash(m, col, .55 + .1 * layer, warp=12, soft=3, edge=.7, seed=seed * 7 + layer)
    # leaf texture dabs
    m, d = c.mask()
    for i in range(70):
        ang = r_.random() * 2 * math.pi; dist = h * .3 * math.sqrt(r_.random())
        px, py = x + dist * math.cos(ang), ground - h * .72 + dist * .85 * math.sin(ang)
        d.ellipse([px - 6, py - 4, px + 6, py + 4], fill=255)
    c.wash(m, greens[-1], .35, warp=2, soft=1, seed=seed + 5)

def mushroom(c, x, ground, s, cap='#d9692e', seed=3):
    m, d = c.mask()
    d.rounded_rectangle([x - s * .18, ground - s * .85, x + s * .18, ground], radius=int(s * .1), fill=255)
    c.wash(m, '#efe2c8', .9, warp=3, seed=seed)
    m, d = c.mask(); d.pieslice([x - s * .62, ground - s * 1.25, x + s * .62, ground - s * .45], 180, 360, fill=255)
    d.ellipse([x - s * .62, ground - s * .95, x + s * .62, ground - s * .7], fill=255)
    c.wash(m, cap, .85, warp=4, edge=.8, seed=seed + 1)
    m, d = c.mask(); r_ = np.random.default_rng(seed)
    for i in range(5):
        px = x + s * (r_.random() - .5) * .8; py = ground - s * (.95 + r_.random() * .2)
        d.ellipse([px - s * .05, py - s * .04, px + s * .05, py + s * .04], fill=255)
    c.lift(m, .9, soft=1.5)

def grass(c, y, col='#4f7d2a', n=260, hmax=46, seed=9, xs=None):
    m, d = c.mask(); r_ = np.random.default_rng(seed)
    for i in range(n):
        x = r_.random() * W if xs is None else r_.choice(xs) + r_.normal(0, 60)
        h = hmax * (.4 + .6 * r_.random()); lean = r_.normal(0, 8)
        d.line([(x, y + 6), (x + lean, y - h)], fill=255, width=3)
    c.wash(m, col, .7, warp=2, soft=1, edge=.3, seed=seed)

def cloud(d, cx, cy, s):
    for dx, dy, r in [(-.5, 0, .32), (-.15, -.18, .42), (.25, -.1, .36), (.55, .04, .28), (0, .08, .4)]:
        d.ellipse([cx + dx * s - r * s, cy + dy * s - r * s * .7, cx + dx * s + r * s, cy + dy * s + r * s * .7], fill=255)

def sky(c, top, bottom, clouds=True, seed=20, alpha=.75):
    m, d = c.mask(); d.rectangle([0, 0, W, H], fill=255)
    g = vgrad(1.0, .45, 0, H * .8)
    c.wash(m, top, alpha, warp=0, soft=0, edge=0, tex=.55, seed=seed, grad=g)
    m, d = c.mask(); d.rectangle([0, 0, W, H], fill=255)
    c.wash(m, bottom, .25, warp=0, soft=0, edge=0, tex=.6, seed=seed + 1, grad=vgrad(0, 1, H * .2, H))
    if clouds:
        m, d = c.mask()
        for cx, cy, s in [(330, 150, 260), (820, 90, 300), (1300, 170, 260), (600, 300, 180), (1120, 330, 200)]:
            cloud(d, cx, cy, s)
        c.lift(m, .75, soft=22)

def sun(c, x, y, r, col='#f7c948'):
    m, d = c.mask(); d.ellipse([x - r, y - r, x + r, y + r], fill=255); c.wash(m, col, .7, warp=6, edge=.6, seed=31)
    m, d = c.mask(); d.ellipse([x - r * 2, y - r * 2, x + r * 2, y + r * 2], fill=255); c.wash(m, col, .18, warp=0, soft=40, edge=0, seed=32)

def flowers(c, y, cols, n=60, seed=40, size=14, zone=None):
    r_ = np.random.default_rng(seed)
    for k, col in enumerate(cols):
        m, d = c.mask()
        for i in range(n // len(cols)):
            if zone: x = r_.choice(zone) + r_.normal(0, 80)
            else: x = r_.random() * W
            yy = y + r_.random() * 70
            for a in range(5):
                t = a / 5 * 2 * math.pi
                d.ellipse([x + math.cos(t) * size * .7 - size * .45, yy + math.sin(t) * size * .7 - size * .45,
                           x + math.cos(t) * size * .7 + size * .45, yy + math.sin(t) * size * .7 + size * .45], fill=255)
        c.wash(m, col, .9, warp=2, soft=1, seed=seed + k, mode='over')

def palm(c, x, ground, h, seed=50, lean=1):
    m, d = c.mask()
    pts = []
    for i in range(21):
        t = i / 20; px = x + lean * h * .16 * t * t; py = ground - h * t
        pts.append((px, py))
    for i in range(20):
        w = h * .035 * (1 - .4 * i / 20)
        d.line([pts[i], pts[i + 1]], fill=255, width=int(w))
    c.wash(m, '#8a5a32', .92, warp=3, seed=seed, mode='over')
    tx, ty = pts[-1]
    m, d = c.mask()
    for k in range(7):
        ang = -math.pi / 2 + (k - 3) * .5 + (.2 if lean > 0 else -.2)
        L = h * (.42 + .06 * (k % 2))
        for j in range(12):
            t = j / 12; t2 = (j + 1) / 12
            sag = .55 * t * t
            p1 = (tx + L * t * math.cos(ang), ty + L * t * math.sin(ang) + L * sag * t)
            p2 = (tx + L * t2 * math.cos(ang), ty + L * t2 * math.sin(ang) + L * .55 * t2 * t2 * t2)
            d.line([p1, p2], fill=255, width=int(h * .05 * (1 - t) + 4))
    c.wash(m, '#3f7d3a', .9, warp=4, edge=.9, seed=seed + 1, mode='over')

def leaves_fall(c, cols, n=40, seed=60):
    r_ = np.random.default_rng(seed)
    for k, col in enumerate(cols):
        m, d = c.mask()
        for i in range(n // len(cols)):
            x, y = r_.random() * W, r_.random() * H * .75; s = 10 + 8 * r_.random(); a = r_.random() * math.pi
            pts = [(x + s * math.cos(a + t) * (1 if j % 2 == 0 else .4), y + s * math.sin(a + t) * (1 if j % 2 == 0 else .4))
                   for j, t in enumerate(np.linspace(0, 2 * math.pi, 9)[:-1])]
            d.polygon(pts, fill=255)
        c.wash(m, col, .85, warp=2, soft=1, seed=seed + k, mode='over')

def stars(c, n=60, seed=70):
    m, d = c.mask(); r_ = np.random.default_rng(seed)
    for i in range(n):
        x, y = r_.random() * W, r_.random() * H * .55; s = 2 + 4 * r_.random() ** 2
        d.ellipse([x - s, y - s, x + s, y + s], fill=255)
    c.lift(m, 1, soft=1.2)


# ---------- refined painters (override the simple ones above) ----------
def tree(c, x, ground, h, greens, trunk='#7a4b2a', seed=1, autumn=False):
    r_ = np.random.default_rng(seed)
    m, d = c.mask()
    d.polygon([(x - h * .05, ground), (x + h * .05, ground), (x + h * .028, ground - h * .6), (x - h * .028, ground - h * .6)], fill=255)
    d.line([(x, ground - h * .42), (x - h * .14, ground - h * .6)], fill=255, width=int(h * .03))
    d.line([(x, ground - h * .47), (x + h * .13, ground - h * .64)], fill=255, width=int(h * .026))
    c.wash(m, trunk, .9, warp=4, seed=seed, mode='over', edge=.9)
    m, d = c.mask()  # bark lines
    for i in range(10):
        yy = ground - h * .55 * r_.random(); d.line([(x - h * .02, yy), (x + h * .015, yy - 8)], fill=255, width=2)
    c.wash(m, '#3b2414', .5, warp=1, soft=.6, seed=seed + 3)
    cy = ground - h * .72
    for layer, col in enumerate(greens):
        m, d = c.mask()
        for i in range(6 + layer * 2):
            ang = r_.random() * 2 * math.pi; dist = h * (.04 + .19 * r_.random()) * (1 - .15 * layer)
            blob(d, x + dist * math.cos(ang), cy + dist * .75 * math.sin(ang) - layer * h * .02,
                 h * (.17 - .025 * layer) * (0.75 + .45 * r_.random()), seed=seed * 10 + i + layer * 50)
        c.wash(m, col, .82, warp=9, soft=2.5, edge=.9, seed=seed * 7 + layer, mode='over')
    # dappled highlights + darker leaf dabs
    for col, n, a, mode in [(greens[0], 70, .5, 'over'), ('#1f4a17', 35, .3, 'mul')]:
        m, d = c.mask()
        for i in range(n):
            ang = r_.random() * 2 * math.pi; dist = h * .3 * math.sqrt(r_.random())
            px, py = x + dist * math.cos(ang), cy + dist * .8 * math.sin(ang)
            sz = 5 + 6 * r_.random(); rot = r_.random() * math.pi
            d.ellipse([px - sz, py - sz * .55, px + sz, py + sz * .55], fill=255)
        c.wash(m, col, a, warp=2, soft=.8, edge=.3, seed=seed + 5 + n, mode=mode)

def bush(c, x, ground, w, h, col, seed=0):
    m, d = c.mask(); d.pieslice([x - w / 2, ground - h, x + w / 2, ground + h], 180, 360, fill=255)
    c.wash(m, col, .9, warp=6, soft=2, edge=.9, seed=seed, mode='over')
    m, d = c.mask()
    for i in range(-3, 4):  # leaf veins like the reference bushes
        xx = x + i * w * .12; d.line([(xx, ground - 4), (x + i * w * .06, ground - h * (.92 - .08 * abs(i)))], fill=255, width=3)
    c.lift(m, .55, soft=1.2)
    m, d = c.mask(); r_ = np.random.default_rng(seed)
    for i in range(35):
        t = r_.random() * math.pi; rr = math.sqrt(r_.random())
        px, py = x - w / 2 * rr * math.cos(t), ground - h * rr * math.sin(t)
        d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=255)
    c.wash(m, '#f3e9a8', .7, warp=0, soft=.5, edge=0, seed=seed + 1, mode='over')

def mushroom(c, x, ground, s, cap='#d9692e', seed=3):
    m, d = c.mask()
    d.polygon([(x - s * .2, ground), (x + s * .2, ground), (x + s * .14, ground - s * .9), (x - s * .14, ground - s * .9)], fill=255)
    c.wash(m, '#efe4cf', .97, warp=3, seed=seed, mode='over', edge=.7)
    m, d = c.mask(); d.rectangle([x + s * .02, ground - s * .9, x + s * .16, ground], fill=255); c.wash(m, '#b9a78a', .35, warp=2, soft=3, edge=0, seed=seed + 9)
    m, d = c.mask(); d.ellipse([x - s * .66, ground - s * 1.05, x + s * .66, ground - s * .8], fill=255); c.wash(m, '#e9d9b8', .95, warp=3, seed=seed + 2, mode='over')
    m, d = c.mask(); d.chord([x - s * .7, ground - s * 1.55, x + s * .7, ground - s * .55], 180, 360, fill=255)
    c.wash(m, cap, .95, warp=4, edge=1, seed=seed + 1, mode='over')
    m, d = c.mask(); d.chord([x - s * .55, ground - s * 1.48, x + s * .1, ground - s * .7], 200, 300, fill=255); c.lift(m, .3, soft=8)
    m, d = c.mask(); r_ = np.random.default_rng(seed)
    for i in range(6):
        px = x + s * (r_.random() - .5) * 1.0; py = ground - s * (1.0 + r_.random() * .32)
        rr = s * (.04 + .04 * r_.random()); d.ellipse([px - rr, py - rr * .8, px + rr, py + rr * .8], fill=255)
    c.wash(m, '#f8efdd', .95, warp=0, soft=.6, edge=0, seed=seed + 4, mode='over')

def grass(c, y, col='#4f7d2a', n=260, hmax=46, seed=9, xs=None):
    r_ = np.random.default_rng(seed)
    for k, cc in enumerate([col, '#7aa83e', '#a9c95a']):
        m, d = c.mask()
        for i in range(n // 3):
            x = r_.random() * W if xs is None else r_.choice(xs) + r_.normal(0, 60)
            h = hmax * (.4 + .8 * r_.random()); lean = r_.normal(0, 10); wdt = 3 + 3 * r_.random()
            d.polygon([(x - wdt, y + 8), (x + wdt, y + 8), (x + lean, y - h)], fill=255)
        c.wash(m, cc, .9, warp=1, soft=.6, edge=.4, seed=seed + k, mode='over')

def dots(c, y0, y1, col, n=300, seed=4, x0=0, x1=W, size=3):
    m, d = c.mask(); r_ = np.random.default_rng(seed)
    for i in range(n):
        x, y = x0 + r_.random() * (x1 - x0), y0 + r_.random() * (y1 - y0); d.ellipse([x - size, y - size * .7, x + size, y + size * .7], fill=255)
    c.wash(m, col, .75, warp=0, soft=.5, edge=0, seed=seed, mode='over')

_sky0 = sky
def sky(c, top, bottom, clouds=True, seed=20, alpha=.75):
    _sky0(c, top, bottom, clouds, seed, alpha)
    # watercolor blooms / backruns
    r_ = np.random.default_rng(seed + 5)
    m, d = c.mask()
    for i in range(6):
        x, y, rr = r_.random() * W, r_.random() * H * .45, 60 + 120 * r_.random()
        d.ellipse([x - rr, y - rr * .7, x + rr, y + rr * .7], outline=255, width=3)
    c.wash(m, top, .14, warp=18, soft=4, edge=0, tex=.3, seed=seed + 6)


def palm(c, x, ground, h, seed=50, lean=1):
    r_ = np.random.default_rng(seed)
    pts = []
    for i in range(21):
        t = i / 20; pts.append((x + lean * h * .16 * t * t, ground - h * t))
    m, d = c.mask()
    for i in range(20):
        w = h * .05 * (1 - .45 * i / 20); d.line([pts[i], pts[i + 1]], fill=255, width=int(w))
    c.wash(m, '#8a5a32', .95, warp=3, seed=seed, mode='over', edge=.9)
    m, d = c.mask()
    for i in range(2, 20, 2):
        (x1, y1) = pts[i]; w = h * .05 * (1 - .45 * i / 20); d.arc([x1 - w * .6, y1 - 6, x1 + w * .6, y1 + 6], 20, 160, fill=255, width=3)
    c.wash(m, '#4a2e17', .55, warp=1, soft=.6, seed=seed + 2)
    tx, ty = pts[-1]
    for layer, col in enumerate(['#4f9a45', '#3a7d35']):
        m, d = c.mask()
        for k in range(8):
            ang = math.pi + k / 7 * math.pi + (r_.random() - .5) * .2 + layer * .18
            L = h * (.36 + .1 * r_.random())
            spine = []
            for j in range(16):
                t = j / 15; spine.append((tx + L * t * math.cos(ang), ty + L * t * math.sin(ang) * .55 + L * .55 * t * t))
            for j in range(15):
                (ax, ay), (bx, by) = spine[j], spine[j + 1]
                t = j / 15; wid = h * .055 * math.sin(math.pi * min(1, t * 1.15 + .05))
                nx, ny = -(by - ay), (bx - ax); nl = math.hypot(nx, ny) or 1; nx, ny = nx / nl, ny / nl
                # serrated leaflets
                d.polygon([(ax, ay), (ax + nx * wid + (bx - ax) * .8, ay + ny * wid + (by - ay) * .8), (bx, by)], fill=255)
                d.polygon([(ax, ay), (ax - nx * wid + (bx - ax) * .8, ay - ny * wid + (by - ay) * .8), (bx, by)], fill=255)
        c.wash(m, col, .92, warp=2, soft=1, edge=.9, seed=seed + 5 + layer, mode='over')
    m, d = c.mask()
    for k in range(4):
        px, py = tx + (k - 1.5) * h * .025, ty + h * .03; d.ellipse([px - h * .02, py - h * .02, px + h * .02, py + h * .02], fill=255)
    c.wash(m, '#c2702c', .9, warp=1, soft=.6, seed=seed + 9, mode='over')

def leaves_fall(c, cols, n=40, seed=60):
    r_ = np.random.default_rng(seed)
    for k, col in enumerate(cols):
        m, d = c.mask()
        for i in range(n // len(cols)):
            x, y = r_.random() * W, r_.random() * H * .78; s_ = 12 + 9 * r_.random(); a = r_.random() * 2 * math.pi
            pts = []
            for j in range(24):
                t = j / 24 * 2 * math.pi; rx, ry = s_ * math.cos(t), s_ * .45 * math.sin(t) * (1 + .3 * math.cos(t))
                pts.append((x + rx * math.cos(a) - ry * math.sin(a), y + rx * math.sin(a) + ry * math.cos(a)))
            d.polygon(pts, fill=255)
        c.wash(m, col, .9, warp=1, soft=.7, edge=.8, seed=seed + k, mode='over')

def crescent(c, x, y, r, off):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m); d.ellipse([x - r, y - r, x + r, y + r], fill=255)
    d.ellipse([x - r + off, y - r - off * .3, x + r + off, y + r - off * .3], fill=0)
    c.lift(m, .97, soft=2.5)
    m2 = Image.new('L', (W, H), 0); ImageDraw.Draw(m2).ellipse([x - r * 1.8, y - r * 1.8, x + r * 1.8, y + r * 1.8], fill=255)
    c.lift(m2, .12, soft=40)
# ---------- scenes ----------
def forest():
    c = Canvas()
    sky(c, '#5b9bd5', '#bfe0ef')
    m, d = c.mask(); hills(d, 650, 40, .004, 1.2); c.wash(m, '#9cbf5a', .75, seed=101, mode='over')
    tree(c, 150, 800, 680, ['#8bbb55', '#629a3b', '#43782b'], seed=2)
    tree(c, 1460, 810, 640, ['#93c05a', '#669d3c', '#477d2d'], seed=3)
    for i, (x, w, h) in enumerate([(330, 230, 190), (470, 170, 150), (600, 150, 110), (1000, 160, 120), (1130, 210, 175), (1270, 170, 140)]):
        bush(c, x, 790, w, h, ['#5e9a3a', '#6faa45', '#4f8a33'][i % 3], seed=110 + i)
    m, d = c.mask(); hills(d, 800, 50, .003, 3.1); c.wash(m, '#b8d066', .95, seed=120, mode='over')
    dots(c, 790, 900, '#eef0b5', n=260, seed=122)
    m, d = c.mask(); hills(d, 870, 22, .006, .5); c.wash(m, '#94b74b', .8, seed=121, mode='over')
    for x, s_, k in [(80, 150, 1), (215, 95, 2), (1500, 160, 3), (1370, 100, 4), (1585, 80, 5)]:
        mushroom(c, x, 885, s_, seed=200 + k)
    grass(c, 892, '#4f7d2a', seed=9, n=240)
    return c

def spring():
    c = Canvas('#fdf9f3')
    sky(c, '#9cc8e8', '#fde8ef', seed=24)
    sun(c, 1420, 130, 70)
    m, d = c.mask(); hills(d, 620, 70, .003, .3); c.wash(m, '#c8dd8a', .7, seed=301)
    m, d = c.mask(); hills(d, 720, 60, .0042, 2.2); c.wash(m, '#a6cc6a', .85, seed=302, mode='over')
    for x, h, s in [(150, 520, 11), (1460, 480, 12)]:
        tree(c, x, 760, h, ['#f7b6cf', '#ef8fb3', '#e0739f'], trunk='#8a5a3c', seed=s)
    for i, (x, w, h) in enumerate([(330, 200, 150), (460, 150, 110), (1150, 180, 140), (1280, 140, 100)]):
        bush(c, x, 800, w, h, ['#7fb24c', '#6aa243', '#8cc05a'][i % 3], seed=310 + i)
    m, d = c.mask(); hills(d, 830, 35, .005, 1.1); c.wash(m, '#86b84f', .92, seed=303, mode='over')
    flowers(c, 800, ['#e8578b', '#f2a33a', '#9b7fe0', '#ffffff'], n=120, zone=[150, 400, 1200, 1450], seed=41, size=13)
    grass(c, 885, '#4e8a32', seed=12, n=220)
    return c

def sea():
    c = Canvas('#fbf8f1')
    sky(c, '#62a8dc', '#d9eef7', seed=27)
    sun(c, 250, 140, 60, '#f6c453')
    m, d = c.mask(); d.rectangle([0, 560, W, H], fill=255); c.wash(m, '#3d8fc4', .7, warp=6, seed=401, grad=vgrad(.7, 1.1, 560, H))
    m, d = c.mask()
    for row in range(5):
        y = 600 + row * 38
        for x in range(-40, W, 120):
            d.arc([x + row * 30, y - 12, x + 80 + row * 30, y + 12], 200, 340, fill=255, width=5)
    c.lift(m, .6, soft=2)
    m, d = c.mask(); d.polygon([(700, 560), (760, 470), (760, 560)], fill=255); d.polygon([(690, 565), (800, 565), (780, 585), (705, 585)], fill=255)
    c.wash(m, '#c96a3d', .75, seed=402)
    m, d = c.mask(); hills(d, 800, 45, .0035, .7); c.wash(m, '#ecd29a', .95, seed=403, mode='over')
    m, d = c.mask(); r_ = np.random.default_rng(8)
    for i in range(40):
        x, y = r_.random() * W, 820 + r_.random() * 70; s = 6 + 10 * r_.random(); d.ellipse([x - s, y - s * .6, x + s, y + s * .6], fill=255)
    c.wash(m, '#b5a48a', .6, seed=404)
    palm(c, 150, 860, 560, seed=51, lean=1); palm(c, 1470, 870, 600, seed=52, lean=-1); palm(c, 1340, 880, 380, seed=53, lean=-1)
    return c

def desert():
    c = Canvas('#fdf7ee')
    sky(c, '#f0a96b', '#fde6c4', clouds=False, seed=29)
    sun(c, 800, 330, 95, '#f3b13c')
    m, d = c.mask(); hills(d, 610, 50, .0025, 1.0); c.wash(m, '#e2a467', .7, seed=501)
    m, d = c.mask()
    d.rectangle([1180, 520, 1260, 610], fill=255); d.pieslice([1170, 470, 1270, 570], 180, 360, fill=255)
    d.rectangle([1290, 470, 1306, 610], fill=255); d.polygon([(1286, 470), (1298, 440), (1310, 470)], fill=255)
    c.wash(m, '#a8653c', .45, warp=3, seed=502)
    m, d = c.mask(); hills(d, 700, 70, .003, 2.6); c.wash(m, '#e9b877', .9, seed=503, mode='over')
    palm(c, 210, 800, 520, seed=54, lean=1); palm(c, 330, 810, 400, seed=55, lean=-1); palm(c, 1420, 810, 540, seed=56, lean=-1)
    m, d = c.mask(); hills(d, 820, 45, .0045, .4); c.wash(m, '#f0c98c', .95, seed=504, mode='over')
    m, d = c.mask(); r_ = np.random.default_rng(9)
    for i in range(14):
        x = r_.random() * W; y = 790 + r_.random() * 90
        d.arc([x - 80, y - 10, x + 80, y + 10], 190, 350, fill=255, width=3)
    c.wash(m, '#b9783e', .5, seed=505)
    return c

def autumn():
    c = Canvas('#fcf7ef')
    sky(c, '#8fb6cf', '#f6e3c8', seed=33)
    m, d = c.mask(); hills(d, 640, 50, .0035, 1.7); c.wash(m, '#c9a35d', .65, seed=601)
    tree(c, 140, 770, 620, ['#f1a33a', '#df6f2c', '#b9481f'], trunk='#6e4428', seed=21)
    tree(c, 1470, 770, 580, ['#f5c04a', '#e98a2f', '#c4582a'], trunk='#6e4428', seed=22)
    tree(c, 1290, 760, 380, ['#e8743a', '#c9542a', '#a33c1f'], trunk='#6e4428', seed=23)
    m, d = c.mask(); hills(d, 800, 45, .003, 2.9); c.wash(m, '#b4a24f', .92, seed=602, mode='over')
    leaves_fall(c, ['#e2792f', '#c9452c', '#f0b23e'], n=60, seed=61)
    for x, s, k in [(90, 100, 1), (210, 70, 2), (1520, 95, 3)]:
        mushroom(c, x, 880, s, cap='#b8452c', seed=230 + k)
    grass(c, 880, '#7d7a2e', seed=14, n=200)
    return c

def night():
    c = Canvas('#f4f1ea')
    m, d = c.mask(); d.rectangle([0, 0, W, H], fill=255)
    c.wash(m, '#1f3a6e', .92, warp=0, soft=0, edge=0, tex=.5, seed=71, grad=vgrad(1.0, .75, 0, H * .7))
    m, d = c.mask(); d.rectangle([0, 0, W, H], fill=255)
    c.wash(m, '#5a4b9a', .35, warp=0, soft=0, edge=0, tex=.7, seed=72, grad=vgrad(0, 1, H * .2, H * .7))
    stars(c, 90)
    crescent(c, 1320, 150, 80, 48)
    m, d = c.mask(); hills(d, 690, 60, .003, .8); c.wash(m, '#26365f', .75, seed=701)
    m, d = c.mask()
    for x, w, h in [(90, 110, 170), (200, 90, 130), (1330, 120, 180), (1450, 100, 140)]:
        d.rectangle([x, 760 - h, x + w, 760], fill=255)
    d.pieslice([1335, 520, 1445, 630], 180, 360, fill=255); d.rectangle([1488, 470, 1500, 640], fill=255)
    c.wash(m, '#18264a', .85, warp=2, seed=702)
    m, d = c.mask()
    for x, y in [(115, 640), (150, 640), (225, 680), (1360, 650), (1400, 650), (1470, 690)]:
        d.rectangle([x, y, x + 18, y + 24], fill=255)
    c.lift(m, .95, soft=1)
    m, d = c.mask()
    for x, y in [(115, 640), (150, 640), (225, 680), (1360, 650), (1400, 650), (1470, 690)]:
        d.rectangle([x, y, x + 18, y + 24], fill=255)
    c.wash(m, '#f6c453', .8, warp=0, soft=1, edge=0, seed=703)
    m, d = c.mask(); hills(d, 820, 40, .004, 2.0); c.wash(m, '#1b2b52', .95, seed=704, mode='over')
    # hanging lanterns (Ramadan)
    for i, (x, l) in enumerate([(420, 120), (560, 190), (1040, 170), (1180, 110)]):
        m, d = c.mask(); d.line([(x, 0), (x, l)], fill=255, width=3); c.wash(m, '#d9c17a', .8, warp=0, soft=.5, seed=710 + i)
        m, d = c.mask(); d.polygon([(x - 22, l + 12), (x + 22, l + 12), (x + 30, l + 50), (x + 18, l + 80), (x - 18, l + 80), (x - 30, l + 50)], fill=255)
        c.lift(m, .9, soft=1.5); c.wash(m, '#f2b53c', .75, warp=2, edge=.6, seed=720 + i)
        m, d = c.mask(); d.ellipse([x - 70, l - 20, x + 70, l + 120], fill=255); c.wash(m, '#f6d77a', .1, warp=0, soft=30, edge=0, seed=730 + i)
    return c

SCENES = {'wcf': forest, 'wcs': spring, 'wcb': sea, 'wcd': desert, 'wca': autumn, 'wcn': night}
if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k in (sys.argv[2:] or SCENES):
        SCENES[k]().save(f'{out}/{k}.webp'); print(k, os.path.getsize(f'{out}/{k}.webp') // 1024, 'KB')
