#!/usr/bin/env python3
"""Emits assets/features/<card>-dark.svg for each README feature, and <step>-{light,dark}.svg for each local mode step:
one looping animated card each.

Every card is plain SVG plus CSS keyframes, so it plays on GitHub with no script and no GIF.
Colors come from the tokens in app/globals.css, icons from components/ui/icons/*.css and
provider marks from public/icons, so the cards stay true to the editor.

Run from anywhere: python3 assets/gen-features.py
"""
import glob
import html
import pathlib
import re
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "features"
W, H = 640, 360
SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"

# ---- app/globals.css, light then .dark -------------------------------------------------------
THEMES = {
    "light": dict(
        bg="#f3f1f0", card="#ffffff", elcard="#fdfcfc", elinput="#f3f1f1", recessed="#f3f1f0",
        border="#e6dfe2", border2="#d9d1d5", fg="#26171d", fg2="#6a595f", muted="#6a595f", faint="#9d8b93",
        secondary="#f1eaed", hover="#ece5e8", accent="#6b6bcf", accentfg="#ffffff",
        primary="#26171d", primaryfg="#ffffff", generate="#3b2b32", generatefg="#ffffff", gendis="#c9c5c9",
        tertiary="#772a4d", tertiaryfg="#d29cb8", caution="#a77231", cautionfg="#ffffff",
        cautionsoft="#f6bd6026", cautionsoftfg="#6f4509", success="#3e8b6a", destructive="#e62324",
        scrubtrack="#e2dde0", scrubprog="#655c61", scrubhover="#d7c7d1", panelfg="#26171d", panellabel="#6a595f",
        orb0="#d99b1f", orb1="#9c3813", onmedia="#000000", onmediafg="#ffffff",
        m_speech="#6a595f", m_image="#0891b2", m_video="#4f46e5", m_music="#7c3aed",
        m_sound="#059669", dot="#26171d", dotop="0.10", shadow="#26171d", shadowop="0.10",
        blob="#f5d3a3", blobop="0.9", glow="#762e4e",
    ),
    "dark": dict(
        bg="#140e11", card="#251e21", elcard="#231e21", elinput="#2e282b", recessed="#140e11",
        border="#332a2e", border2="#453a3f", fg="#f1eaed", fg2="#b8a5ad", muted="#9d8b93", faint="#6a595f",
        secondary="#261c1f", hover="#372f32", accent="#7a79d6", accentfg="#ffffff",
        primary="#f1eaed", primaryfg="#150e11", generate="#e2dde0", generatefg="#231e21", gendis="#403a3e",
        tertiary="#772a4d", tertiaryfg="#d29cb8", caution="#b57e38", cautionfg="#ffffff",
        cautionsoft="#a7723159", cautionsoftfg="#e4c69a", success="#489872", destructive="#f73b3b",
        scrubtrack="#656264", scrubprog="#ffffff", scrubhover="#c2c0c1", panelfg="#e0dbde", panellabel="#f9e6f6",
        orb0="#ffbf48", orb1="#be4a1d", onmedia="#000000", onmediafg="#ffffff",
        m_speech="#9d8b93", m_image="#22d3ee", m_video="#818cf8", m_music="#a78bfa",
        m_sound="#34d399", dot="#f1eaed", dotop="0.08", shadow="#000000", shadowop="0.35",
        blob="#4a3a2a", blobop="0.9", glow="#e4b5d4",
    ),
}

# ---- generated images already shipped in the README demo (real OpenSlop renders) -----------------
_DEMO = (ROOT / "assets" / "openslop-demo-dark.svg").read_text()
DEMO_IMAGES = {m.group(1): m.group(2) for m in re.finditer(r'<image id="ph-([a-z0-9]+)" width="\d+" height="\d+"[^>]*href="(data:image/[^"]+)"', _DEMO)}

# ---- the app's own icon set ----------------------------------------------------------------------
_ICON_CSS = "".join(p.read_text() for p in (ROOT / "components" / "ui" / "icons").glob("*.css"))


def icon_markup(name):
    m = re.search(r"--%s-icon:\s*url\(\"data:image/svg\+xml,([^\"]+)\"\)" % re.escape(name), _ICON_CSS)
    if not m:
        raise KeyError(name)
    svg = urllib.parse.unquote(m.group(1)).strip()
    inner = re.sub(r"^<svg[^>]*>|</svg>$", "", svg)
    inner = re.sub(r"<defs>.*?</defs>", "", inner)
    inner = re.sub(r" clip-path='url\(#[^']*\)'", "", inner)
    return inner


def thumbnail(data_uri, width):
    """A data-URI image re-encoded as a JPEG `width` pixels wide."""
    import base64
    import io

    from PIL import Image

    img = Image.open(io.BytesIO(base64.b64decode(data_uri.split(",", 1)[1]))).convert("RGB")
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, "JPEG", quality=72, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(out.getvalue()).decode()


def mix(hex_a, hex_b, t):
    a = [int(hex_a[i : i + 2], 16) for i in (1, 3, 5)]
    b = [int(hex_b[i : i + 2], 16) for i in (1, 3, 5)]
    return "#%02x%02x%02x" % tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


INTER = {
    400: {"0": 0.61, "1": 0.36, "2": 0.56, "3": 0.6, "4": 0.62, "5": 0.58, "6": 0.58, "7": 0.51, "8": 0.58, "9": 0.58, " ": 0.25, "!": 0.22, "\"": 0.4, "#": 0.6, "$": 0.61, "%": 0.83, "&": 0.61, "'": 0.25, "(": 0.3, ")": 0.3, "*": 0.46, "+": 0.62, ",": 0.22, "-": 0.44, ".": 0.22, "/": 0.33, ":": 0.22, ";": 0.22, "<": 0.63, "=": 0.63, ">": 0.63, "?": 0.52, "@": 0.97, "A": 0.66, "B": 0.63, "C": 0.71, "D": 0.68, "E": 0.58, "F": 0.55, "G": 0.73, "H": 0.7, "I": 0.23, "J": 0.54, "K": 0.63, "L": 0.53, "M": 0.86, "N": 0.71, "O": 0.74, "P": 0.61, "Q": 0.74, "R": 0.63, "S": 0.61, "T": 0.6, "U": 0.7, "V": 0.65, "W": 0.95, "X": 0.65, "Y": 0.64, "Z": 0.62, "[": 0.3, "\\": 0.33, "]": 0.3, "^": 0.44, "_": 0.45, "`": 0.24, "a": 0.52, "b": 0.57, "c": 0.53, "d": 0.57, "e": 0.54, "f": 0.31, "g": 0.57, "h": 0.55, "i": 0.21, "j": 0.21, "k": 0.51, "l": 0.21, "m": 0.84, "n": 0.55, "o": 0.56, "p": 0.57, "q": 0.57, "r": 0.32, "s": 0.48, "t": 0.31, "u": 0.55, "v": 0.51, "w": 0.75, "x": 0.51, "y": 0.51, "z": 0.48, "{": 0.39, "|": 0.29, "}": 0.38, "~": 0.64, "…": 0.66, "“": 0.34, "”": 0.34, "‘": 0.19, "’": 0.19, "•": 0.49, "—": 1, "–": 0.5, "·": 0.22, "é": 0.54},
    500: {"0": 0.63, "1": 0.37, "2": 0.57, "3": 0.6, "4": 0.64, "5": 0.58, "6": 0.59, "7": 0.52, "8": 0.59, "9": 0.59, " ": 0.24, "!": 0.24, "\"": 0.43, "#": 0.61, "$": 0.63, "%": 0.87, "&": 0.62, "'": 0.26, "(": 0.31, ")": 0.31, "*": 0.49, "+": 0.63, ",": 0.23, "-": 0.44, ".": 0.24, "/": 0.34, ":": 0.24, ";": 0.24, "<": 0.63, "=": 0.63, ">": 0.63, "?": 0.54, "@": 0.98, "A": 0.66, "B": 0.65, "C": 0.72, "D": 0.69, "E": 0.59, "F": 0.57, "G": 0.73, "H": 0.71, "I": 0.24, "J": 0.54, "K": 0.65, "L": 0.55, "M": 0.87, "N": 0.72, "O": 0.75, "P": 0.62, "Q": 0.75, "R": 0.64, "S": 0.63, "T": 0.61, "U": 0.7, "V": 0.67, "W": 0.96, "X": 0.67, "Y": 0.66, "Z": 0.63, "[": 0.31, "\\": 0.34, "]": 0.31, "^": 0.45, "_": 0.46, "`": 0.26, "a": 0.53, "b": 0.58, "c": 0.53, "d": 0.57, "e": 0.54, "f": 0.33, "g": 0.57, "h": 0.56, "i": 0.21, "j": 0.22, "k": 0.52, "l": 0.22, "m": 0.86, "n": 0.56, "o": 0.56, "p": 0.58, "q": 0.57, "r": 0.34, "s": 0.49, "t": 0.33, "u": 0.56, "v": 0.53, "w": 0.77, "x": 0.51, "y": 0.53, "z": 0.5, "{": 0.41, "|": 0.31, "}": 0.41, "~": 0.65, "…": 0.7, "“": 0.37, "”": 0.37, "‘": 0.2, "’": 0.2, "•": 0.47, "—": 1, "–": 0.5, "·": 0.24, "é": 0.54},
    600: {"0": 0.65, "1": 0.38, "2": 0.59, "3": 0.62, "4": 0.64, "5": 0.59, "6": 0.61, "7": 0.53, "8": 0.61, "9": 0.62, " ": 0.23, "!": 0.23, "\"": 0.45, "#": 0.62, "$": 0.64, "%": 0.9, "&": 0.64, "'": 0.27, "(": 0.32, ")": 0.32, "*": 0.52, "+": 0.65, ",": 0.24, "-": 0.45, ".": 0.23, "/": 0.35, ":": 0.23, ";": 0.23, "<": 0.65, "=": 0.65, ">": 0.64, "?": 0.55, "@": 1.01, "A": 0.69, "B": 0.64, "C": 0.72, "D": 0.7, "E": 0.6, "F": 0.57, "G": 0.74, "H": 0.71, "I": 0.25, "J": 0.55, "K": 0.66, "L": 0.55, "M": 0.88, "N": 0.72, "O": 0.75, "P": 0.62, "Q": 0.75, "R": 0.64, "S": 0.64, "T": 0.62, "U": 0.7, "V": 0.69, "W": 0.98, "X": 0.68, "Y": 0.67, "Z": 0.63, "[": 0.32, "\\": 0.35, "]": 0.32, "^": 0.45, "_": 0.47, "`": 0.28, "a": 0.54, "b": 0.58, "c": 0.54, "d": 0.58, "e": 0.56, "f": 0.35, "g": 0.59, "h": 0.57, "i": 0.23, "j": 0.23, "k": 0.53, "l": 0.23, "m": 0.86, "n": 0.57, "o": 0.57, "p": 0.58, "q": 0.58, "r": 0.35, "s": 0.5, "t": 0.35, "u": 0.57, "v": 0.54, "w": 0.8, "x": 0.53, "y": 0.54, "z": 0.52, "{": 0.43, "|": 0.33, "}": 0.43, "~": 0.64, "…": 0.71, "“": 0.4, "”": 0.4, "‘": 0.21, "’": 0.21, "•": 0.45, "—": 1, "–": 0.5, "·": 0.23, "é": 0.56},
    700: {"0": 0.65, "1": 0.39, "2": 0.6, "3": 0.62, "4": 0.65, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.61, "9": 0.62, " ": 0.21, "!": 0.25, "\"": 0.47, "#": 0.63, "$": 0.64, "%": 0.93, "&": 0.65, "'": 0.27, "(": 0.33, ")": 0.33, "*": 0.54, "+": 0.66, ",": 0.24, "-": 0.45, ".": 0.25, "/": 0.36, ":": 0.25, ";": 0.25, "<": 0.65, "=": 0.66, ">": 0.66, "?": 0.57, "@": 1, "A": 0.72, "B": 0.64, "C": 0.72, "D": 0.7, "E": 0.6, "F": 0.58, "G": 0.73, "H": 0.71, "I": 0.25, "J": 0.56, "K": 0.68, "L": 0.55, "M": 0.89, "N": 0.72, "O": 0.75, "P": 0.62, "Q": 0.75, "R": 0.64, "S": 0.64, "T": 0.63, "U": 0.7, "V": 0.71, "W": 1, "X": 0.7, "Y": 0.68, "Z": 0.64, "[": 0.33, "\\": 0.36, "]": 0.33, "^": 0.47, "_": 0.48, "`": 0.3, "a": 0.55, "b": 0.6, "c": 0.56, "d": 0.6, "e": 0.56, "f": 0.37, "g": 0.6, "h": 0.59, "i": 0.24, "j": 0.24, "k": 0.55, "l": 0.25, "m": 0.88, "n": 0.59, "o": 0.58, "p": 0.6, "q": 0.6, "r": 0.37, "s": 0.52, "t": 0.37, "u": 0.59, "v": 0.55, "w": 0.82, "x": 0.54, "y": 0.55, "z": 0.53, "{": 0.44, "|": 0.35, "}": 0.44, "~": 0.64, "…": 0.73, "“": 0.43, "”": 0.43, "‘": 0.23, "’": 0.23, "•": 0.43, "—": 1, "–": 0.5, "·": 0.25, "é": 0.56},
}


def tw(s, size, weight=400, family=None):
    """Text width in Inter, measured from public/fonts/InterVariable.woff2."""
    if family == MONO:
        return len(s) * size * 0.62 / 1.06
    t = INTER[weight]
    return sum(t.get(ch, 0.6) for ch in s) * size * 1.06  # a little slack for wider system fonts


class Card:
    def __init__(self, name, title, desc, loop, theme):
        self.name, self.title, self.desc, self.loop = name, title, desc, loop
        self.t = THEMES[theme]
        self.theme = theme
        self.css, self.body, self.defs, self.n = [], [], [], 0
        self._images = set()

    # ---- timing helpers: every class is a keyframe on the card's own loop
    def pct(self, t):
        return f"{max(0.0, min(t, self.loop)) / self.loop * 100:.2f}%"

    def cls(self, prefix):
        self.n += 1
        return f"{prefix}{self.n}"

    def appear(self, t, dy=4, fade=0.3):
        c = self.cls("a")
        self.css.append(
            f".{c}{{animation:kf-{c} {self.loop}s infinite both}}@keyframes kf-{c}{{0%,{self.pct(t - 0.01)}{{opacity:0;transform:translate(0,{dy}px)}}{self.pct(t + fade)},100%{{opacity:1;transform:translate(0,0)}}}}"
        )
        return c

    def span(self, t, until, fade=0.15):
        c = self.cls("s")
        tail = "" if until >= self.loop else f"{self.pct(until + fade)},100%{{opacity:0}}"
        lead = f"0%,{self.pct(t - 0.01)}{{opacity:0}}" if t > 0 else ""
        self.css.append(
            f".{c}{{animation:kf-{c} {self.loop}s infinite both}}@keyframes kf-{c}{{{lead}{self.pct(t + fade)},{self.pct(until)}{{opacity:1}}{tail}}}"
        )
        return c

    def shift(self, t, dx=0, dy=0, dur=0.3):
        c = self.cls("m")
        self.css.append(
            f".{c}{{animation:kf-{c} {self.loop}s infinite both}}@keyframes kf-{c}{{0%,{self.pct(t)}{{transform:translate(0,0)}}{self.pct(t + dur)},100%{{transform:translate({dx}px,{dy}px)}}}}"
        )
        return c

    def grow(self, t0, t1, origin="left center", axis="X"):
        c = self.cls("g")
        self.css.append(
            f".{c}{{animation:kf-{c} {self.loop}s linear infinite both;transform-box:fill-box;transform-origin:{origin}}}@keyframes kf-{c}{{0%,{self.pct(t0 - 0.01)}{{transform:scale{axis}(0)}}{self.pct(t1)},100%{{transform:scale{axis}(1)}}}}"
        )
        return c

    def slide(self, t0, t1, dx):
        c = self.cls("l")
        self.css.append(
            f".{c}{{animation:kf-{c} {self.loop}s linear infinite both}}@keyframes kf-{c}{{0%,{self.pct(t0)}{{transform:translate(0,0)}}{self.pct(t1)},100%{{transform:translate({dx}px,0)}}}}"
        )
        return c

    def pulse(self, period=1.2, lo=0.35):
        c = self.cls("p")
        self.css.append(f".{c}{{animation:kf-{c} {period}s ease-in-out infinite}}@keyframes kf-{c}{{0%,100%{{opacity:1}}50%{{opacity:{lo}}}}}")
        return c

    def spin(self, period=1.0, reverse=False):
        c = self.cls("r")
        self.css.append(
            f".{c}{{animation:kf-{c} {period}s linear infinite{' reverse' if reverse else ''};transform-box:fill-box;transform-origin:center}}@keyframes kf-{c}{{to{{transform:rotate(360deg)}}}}"
        )
        return c

    def orbit(self, period, ox, oy, reverse=False):
        """Rotates a group about a point given relative to its own fill box."""
        c = self.cls("o")
        self.css.append(
            f".{c}{{animation:kf-orbit {period}s linear infinite{' reverse' if reverse else ''};transform-box:fill-box;transform-origin:{ox:.1f}px {oy:.1f}px}}"
        )
        if "kf-orbit" not in self._images:
            self._images.add("kf-orbit")
            self.css.append("@keyframes kf-orbit{to{transform:rotate(360deg)}}")
        return c

    def blink(self, period=1.0):
        c = self.cls("b")
        self.css.append(f".{c}{{animation:kf-{c} {period}s steps(1) infinite}}@keyframes kf-{c}{{0%{{opacity:1}}50%{{opacity:0}}}}")
        return c

    def keys(self, frames, ease="cubic-bezier(.4,0,.2,1)", origin=None):
        """A class stepping through (t, css) frames on the card's loop, held before the first and after the last."""
        c = self.cls("k")
        steps = "".join(f"{self.pct(at)}{{{css}}}" for at, css in frames)
        box = f";transform-box:fill-box;transform-origin:{origin}" if origin else ""
        self.css.append(
            f".{c}{{animation:kf-{c} {self.loop}s {ease} infinite both{box}}}@keyframes kf-{c}{{0%{{{frames[0][1]}}}{steps}100%{{{frames[-1][1]}}}}}"
        )
        return c

    def cursor(self, path):
        """A mouse pointer gliding through (t, x, y) points. Draw it last so it sits on top."""
        c = self.keys([(at, f"transform:translate({x}px,{y}px)") for at, x, y in path])
        self.raw(f'<g class="{c}"><path d="M0 0V14.5L3.6 11.2L6.2 16.8L8.6 15.7L6 10.2H11Z" fill="#ffffff" stroke="#111111" stroke-width="1.1" stroke-linejoin="round"/></g>')

    def click(self, at, x, y):
        """The ripple a click leaves under the pointer."""
        c = self.keys([(at - 0.01, "opacity:0;transform:scale(.2)"), (at, "opacity:.8;transform:scale(.2)"), (at + 0.45, "opacity:0;transform:scale(1)")], ease="ease-out", origin="center")
        self.raw(f'<g class="{c}"><circle cx="{x}" cy="{y}" r="13" fill="{self.t["accent"]}" fill-opacity=".3" stroke="{self.t["accent"]}"/></g>')

    # ---- drawing helpers
    def raw(self, s):
        self.body.append(s)

    def wrap(self, markup, cls):
        """Nest `markup` in one <g> per class, innermost first, so each animation owns its own element."""
        for c in [c for c in (cls or "").split() if c]:
            markup = f'<g class="{c}">{markup}</g>'
        return markup

    def text(self, x, y, s, size=11, fill=None, cls="", anchor="start", weight=400, family=None, extra=""):
        fill = fill or self.t["fg"]
        self.body.append(
            self.wrap(f'<text x="{x}" y="{y}" font-family="{family or SANS}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" style="white-space:pre" {extra}>{html.escape(s)}</text>', cls)
        )

    def icon(self, name, x, y, size=16, color=None, cls="", opacity=1):
        color = color or self.t["fg"]
        s = size / 16
        self.body.append(self.wrap(f'<g color="{color}" opacity="{opacity}" transform="translate({x},{y}) scale({s:.4f})">{icon_markup(name)}</g>', cls))

    def rect(self, x, y, w, h, fill, rx=0, stroke=None, cls="", opacity=1, sw=1, extra=""):
        st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
        self.body.append(self.wrap(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{st} opacity="{opacity}" {extra}/>', cls))

    def shadow(self, x, y, w, h, rx, strength=1.0, cls=""):
        t = self.t
        out = []
        for i, (dy, blur, op) in enumerate(((1, 2, 0.5), (4, 6, 0.35), (10, 14, 0.25))):
            out.append(
                f'<rect x="{x - blur / 2}" y="{y + dy - blur / 2}" width="{w + blur}" height="{h + blur}" rx="{rx + blur / 2}" fill="{t["shadow"]}" opacity="{float(t["shadowop"]) * op * strength:.3f}"/>'
            )
        self.raw(self.wrap("".join(out), cls))

    def typewriter(self, x, y, s, t0, t1, size=11, fill=None, cls="", weight=400, erase=None, caret=False, start=0, family=None):
        """Types `s` between t0 and t1 with a stepped clip. `erase=(e0,e1)` wipes it again.
        `start` is how many leading characters are already there (an edit appended to a line)."""
        cid = self.cls("tw")
        w = tw(s, size, weight, family) * 1.06 + 4 + (8 if caret else 0)
        n = max(1, len(s) - start)
        f0 = f"{tw(s[:start], size, weight, family) / w:.4f}" if start else "0"
        e = f"{self.pct(erase[0])}{{transform:scaleX(1);animation-timing-function:steps({n},end)}}{self.pct(erase[1])},100%{{transform:scaleX({f0})}}" if erase else "100%{transform:scaleX(1)}"
        self.css.append(
            f".{cid}{{animation:kf-{cid} {self.loop}s infinite both;transform-box:fill-box;transform-origin:left center}}@keyframes kf-{cid}{{0%,{self.pct(t0)}{{transform:scaleX({f0});animation-timing-function:steps({n},end)}}{self.pct(t1)}{{transform:scaleX(1)}}{e}}}"
        )
        self.defs.append(f'<clipPath id="{cid}"><rect class="{cid}" x="{x - 1}" y="{y - size}" width="{w}" height="{size * 1.5}"/></clipPath>')
        fill = fill or self.t["fg"]
        tail = f'<tspan class="{self.blink(1.0)}" fill="{self.t["accent"]}">|</tspan>' if caret else ""
        self.body.append(
            self.wrap(f'<text x="{x}" y="{y}" font-family="{family or SANS}" font-size="{size}" font-weight="{weight}" fill="{fill}" style="white-space:pre" clip-path="url(#{cid})">{html.escape(s)}{tail}</text>', cls)
        )

    @staticmethod
    def pill_w(label, size=10, icon=None, chevron=False, pad=7, weight=500, icon_size=None):
        isz = icon_size or size + 2
        return pad * 2 + tw(label, size, weight) + (isz + 4 if icon else 0) + (10 if chevron else 0)

    def pill(self, x, y, label, size=10, fill=None, color=None, icon=None, icon_color=None, chevron=False, h=None, pad=7, cls="", weight=500, icon_size=None):
        t = self.t
        fill = fill or t["secondary"]
        color = color or t["fg"]
        h = h or size + 9
        isz = icon_size or size + 2
        w = self.pill_w(label, size, icon, chevron, pad, weight, icon_size)
        self.rect(x, y, w, h, fill, rx=h / 2 if not chevron else 5, cls=cls)
        cx = x + pad
        if icon:
            self.icon(icon, cx, y + (h - isz) / 2, isz, icon_color or color, cls=cls)
            cx += isz + 4
        self.text(cx, y + h / 2 + size * 0.36, label, size, color, cls=cls, weight=weight)
        if chevron:
            self.icon("chevron-down", x + w - pad - 8, y + (h - 8) / 2, 8, t["muted"], cls=cls)
        return w

    @staticmethod
    def button_w(label, icon=None, size=10, pad=10):
        return pad * 2 + tw(label, size, 500) + (size + 3 + 5 if icon else 0)

    def button(self, x, y, label, icon=None, variant="generate", size=10, cls="", h=24, pad=10, icon_cls=""):
        t = self.t
        fill, color = {
            "generate": (t["generate"], t["generatefg"]),
            "panel": (t["secondary"], t["fg"]),
            "primary": (t["primary"], t["primaryfg"]),
            "accent": (t["accent"], t["accentfg"]),
            "secondary": (t["secondary"], t["fg"]),
            "ghost": ("none", t["muted"]),
            "destructive": (t["destructive"], "#ffffff"),
        }[variant]
        isz = size + 3
        w = self.button_w(label, icon, size, pad)
        self.rect(x, y, w, h, fill, rx=6, cls=cls)
        cx = x + pad
        if icon:
            self.icon(icon, cx, y + (h - isz) / 2, isz, color, cls=icon_cls or cls)
            cx += isz + 5
        self.text(cx, y + h / 2 + size * 0.36, label, size, color, cls=cls, weight=500)
        return w

    def badge(self, x, y, label, variant, icon=None, size=9, cls=""):
        t = self.t
        fill, color = {
            "default": (t["secondary"], t["fg"]),
            "tertiary": (t["tertiary"], t["tertiaryfg"]),
            "caution": (t["caution"], t["cautionfg"]),
        }[variant]
        return self.pill(x, y, label, size, fill, color, icon=icon, h=size + 7, pad=6, cls=cls, icon_size=size + 1)

    def type_pill(self, x, y, kind, label, size=9, cls="", h=18):
        """The element card's tinted type pill: bg media/15, text media."""
        t = self.t
        tint = t["m_" + kind]
        icon = {"speech": "voice", "image": "image", "video": "video", "sound": "wave-sine", "music": "music"}[kind]
        bg = mix(t["elcard"], tint, 0.15)
        return self.pill(x, y, label, size, bg, tint, icon=icon, h=h, pad=5, cls=cls, weight=500, icon_size=11)

    def model_badge(self, x, y, label, provider="openslop", size=9, cls="", icon_name=None):
        t = self.t
        w = 4 + 11 + 5 + tw(label, size) + 6 + 8 + 4
        cx = x + 4
        if icon_name:
            self.icon(icon_name, cx, y + 3, 11, t["muted"], cls=cls)
        else:
            self.provider_mark(provider, cx, y + 3, 11, cls=cls)
        self.text(cx + 16, y + 12.3, label, size, t["muted"], cls=cls)
        self.icon("chevron-down", x + w - 12, y + 5, 8, t["muted"], cls=cls)
        return w

    def provider_mark(self, provider, x, y, size, cls="", color=None):
        """Real marks from public/icons; OpenSlop and Cartesia are masked in the app, so they take the text color."""
        t = self.t
        color = color or t["fg"]
        file = {"openslop": ROOT / "public" / "openslop-mark.svg", "anthropic": ROOT / "public" / "icons" / "claude.svg"}
        path = file.get(provider, ROOT / "public" / "icons" / f"{provider}.svg")
        svg = path.read_text()
        vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
        inner = re.sub(r"^\s*<svg[^>]*>|</svg>\s*$", "", svg.strip(), flags=re.S)
        inner = re.sub(r"<title>.*?</title>", "", inner)
        uid = f"{provider}{self.n}"
        self.n += 1
        inner = re.sub(r'id="([^"]+)"', lambda m: f'id="{uid}-{m.group(1)}"', inner)
        inner = re.sub(r"url\(#([^)]+)\)", lambda m: f"url(#{uid}-{m.group(1)})", inner)
        inner = re.sub(r'xlink:href="#([^"]+)"', lambda m: f'xlink:href="#{uid}-{m.group(1)}"', inner)
        if provider in ("openslop", "cartesia"):
            inner = re.sub(r'fill="(?!none)[^"]*"', f'fill="{color}"', inner)
            inner = re.sub(r"<path (?![^>]*fill=)", f'<path fill="{color}" ', inner)
        rx = ' rx="3"' if provider not in ("openslop", "cartesia") else ""
        self.raw(self.wrap(f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{vb}" overflow="visible" color="{color}">{inner}</svg>', cls))

    def orb(self, x, y, size=20, cls=""):
        """The OrbLoader exactly as the README demo draws it: three blurred triangles spinning under a
        contrast filter (the goo), masking a warm gradient that slowly shifts hue."""
        t = self.t
        if "orb" not in self._images:
            self._images.add("orb")
            self.defs.append(
                f'<linearGradient id="orb" x1="0" y1="0" x2="0" y2="1"><stop offset="30%" stop-color="{t["orb0"]}"/><stop offset="70%" stop-color="{t["orb1"]}"/></linearGradient>'
                '<mask id="orb-mask"><g class="orb-goo"><polygon class="orb-p0" points="0,0 100,0 100,100 0,100" fill="#000000"/><polygon class="orb-p1" points="25,25 75,25 50,75" fill="#ffffff"/><polygon class="orb-p2" points="50,25 75,75 25,75" fill="#ffffff"/><polygon class="orb-p3" points="35,35 65,35 50,65" fill="#ffffff"/></g></mask>'
            )
            self.css.append(
                ".orb{animation:kf-orb-colorize 6s ease-in-out infinite}@keyframes kf-orb-colorize{0%{filter:hue-rotate(0deg)}20%{filter:hue-rotate(-30deg)}40%{filter:hue-rotate(-60deg)}60%{filter:hue-rotate(-90deg)}80%{filter:hue-rotate(-45deg)}100%{filter:hue-rotate(0deg)}}"
                ".orb-goo{filter:contrast(15);animation:kf-orb-roundness 1s linear infinite}@keyframes kf-orb-roundness{0%{filter:contrast(15)}20%,40%{filter:contrast(3)}60%,100%{filter:contrast(15)}}"
                ".orb-goo polygon{filter:blur(12px)}"
                ".orb-p0{transform-origin:75px 25px;transform:rotate(90deg)}"
                ".orb-p1{transform-origin:50px 50px;animation:kf-orb-spin 2s linear infinite reverse}"
                ".orb-p2{transform-origin:50px 60px;animation:kf-orb-spin 2s linear infinite;animation-delay:-0.667s}"
                ".orb-p3{transform-origin:40px 40px;animation:kf-orb-spin 2s linear infinite reverse}"
                "@keyframes kf-orb-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}"
            )
        k = size / 100
        self.raw(self.wrap(f'<g class="orb" transform="translate({x},{y}) rotate(90,{size / 2},{size / 2}) scale({k:.3f})"><rect width="100" height="100" fill="url(#orb)" mask="url(#orb-mask)"/></g>', cls))

    def waveform(self, x, y, w, h, color, seed=1, cls="", bars=None, opacity=1):
        import math

        bars = bars or int(w / 3)
        step = w / bars
        out = [f'<g class="{cls}" fill="{color}" opacity="{opacity}">']
        for i in range(bars):
            a = 0.35 + 0.65 * abs(math.sin(i * 0.9 + seed) * math.cos(i * 0.37 + seed * 1.7))
            bh = max(2, h * a)
            out.append(f'<rect x="{x + i * step:.1f}" y="{y + (h - bh) / 2:.1f}" width="{max(1, step - 1.2):.1f}" height="{bh:.1f}" rx="0.8"/>')
        out.append("</g>")
        self.raw("".join(out))

    # PlaceholderBallsLoader, from placeholder-balls.tsx and its module.css: eleven orbs of
    # diameter 400px+size, blurred 58px, hard-light, each orbiting a pivot 400px right of its own
    # left edge, the whole loader scaled 0.5 inside a preview about 146px tall.
    BALLS = [
        ("#cab3d6", 14, 4.2, 40, -100), ("#f5aa64", 16, 5.8, -50, 280), ("#f58c02", 10, 7.3, 90, 220), ("#94c9e9", 18, 6.4, -75, -70),
        ("#eeaeca", 20, 10, 25, 120), ("#f57802", 12, 3.7, -40, 190), ("#cab3d6", 11, 2.6, 75, -150), ("#f5aa64", 17, 6.9, -25, 140),
        ("#f55702", 13, 5.3, 60, -220), ("#94c9e9", 19, 7.7, -90, 240), ("#5eaebf", 16, 6.3, 85, -180),
    ]

    def balls(self, x, y, w, h, cls="", animate=True, seed=3, ref_h=146):
        k = 0.5 * (h / ref_h)
        cx, cy = x + w / 2, y + h / 2
        cid = self.cls("bc")
        self.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>')
        blur = max(4, 58 * k)
        fid = self.cls("bf")
        self.defs.append(f'<filter id="{fid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="{blur:.1f}"/></filter>')
        out = [f'<g clip-path="url(#{cid})">']
        for i, (col, size, dur, bx, by) in enumerate(self.BALLS):
            r = (400 + size) / 2 * k
            d = (200 - size / 2) * k
            px, py = cx + bx * k, cy + (by + size / 2) * k
            angle = (seed * 47 + i * 83) % 360
            if animate:
                sp = self.orbit(dur, d + r, r, reverse=i % 2 == 1)
                out.append(f'<g transform="translate({px:.1f},{py:.1f}) rotate({angle})"><g class="{sp}"><circle cx="{-d:.1f}" cy="0" r="{r:.1f}" fill="{col}" filter="url(#{fid})" style="mix-blend-mode:hard-light"/></g></g>')
            else:
                out.append(f'<g transform="translate({px:.1f},{py:.1f}) rotate({angle})"><circle cx="{-d:.1f}" cy="0" r="{r:.1f}" fill="{col}" filter="url(#{fid})" style="mix-blend-mode:hard-light"/></g>')
        out.append("</g>")
        self.raw(self.wrap("".join(out), cls))

    def media_placeholder(self, x, y, w, h, cls="", animate=True, seed=3):
        """MediaPlaceholder: a bordered 16:9 box with the orbs inside."""
        t = self.t
        self.rect(x, y, w, h, t["elcard"], rx=6, stroke=t["border"], cls=cls)
        self.balls(x + 1, y + 1, w - 2, h - 2, cls=cls, animate=animate, seed=seed)

    def audio_placeholder(self, x, y, w, h, cls="", animate=True, seed=5):
        """AudioPlaceholder: the same orbs seen through a soundwave-shaped mask, blurred, on bg-muted."""
        import math

        t = self.t
        self.rect(x, y, w, h, t["secondary"], rx=6, stroke=t["border"], cls=cls)
        n = 60
        hs = [20 + 80 * abs(math.sin(i * 0.7 + seed) * math.cos(i * 0.23 + seed * 1.3)) for i in range(n)]
        hs = [(hs[max(0, i - 1)] + hs[i] + hs[min(n - 1, i + 1)]) / 3 for i in range(n)]
        top = [(x + i * w / (n - 1), y + h * (100 - hh) / 200) for i, hh in enumerate(hs)]
        bot = [(x + i * w / (n - 1), y + h * (100 + hh) / 200) for i, hh in enumerate(hs)][::-1]
        pts = " ".join(f"{px:.1f},{py:.1f}" for px, py in top + bot)
        mid = self.cls("am")
        self.defs.append(f'<clipPath id="{mid}"><polygon points="{pts}"/></clipPath>')
        bl = self.cls("ab")
        self.defs.append(f'<filter id="{bl}"><feGaussianBlur stdDeviation="2.5"/></filter>')
        # the mask clips, then the blur softens the edge like the app's blur-[6px]
        self.raw(f'<g class="{cls.split()[0] if cls else ""}">' if cls else "<g>")
        for c in cls.split()[1:]:
            self.raw(f'<g class="{c}">')
        self.raw(f'<g clip-path="url(#{mid})" filter="url(#{bl})">')
        self.balls(x, y - h, w, h * 3, animate=animate, seed=seed, ref_h=146 * 3)
        self.raw("</g>")
        self.raw("</g>" * max(1, len(cls.split())))

    def image(self, name, x, y, w, h, rx=6, cls="", stroke=True, opacity=1, thumb=False):
        """One of the demo's generated renders, cropped like object-fit: cover.
        `thumb` re-encodes it at twice the drawn size, for small tiles."""
        t = self.t
        uid = f"im-{name}"
        if uid not in self._images:
            self._images.add(uid)
            href = thumbnail(DEMO_IMAGES[name], round(w * 2)) if thumb else DEMO_IMAGES[name]
            self.defs.append(f'<image id="{uid}" width="16" height="9" preserveAspectRatio="xMidYMid slice" href="{href}"/>')
        cid = self.cls("ic")
        self.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/></clipPath>')
        aw, ah = (16, 9) if name not in ("takeshi", "ryu") else (16, 16)
        # cover: scale so the 16:9 (or square) frame fills the box
        sc = max(w / aw, h / ah)
        ox, oy = x + (w - aw * sc) / 2, y + (h - ah * sc) / 2
        self.raw(self.wrap(f'<g clip-path="url(#{cid})" opacity="{opacity}"><use href="#{uid}" transform="translate({ox:.2f},{oy:.2f}) scale({sc:.4f})"/></g>', cls))
        if stroke:
            self.rect(x + 0.5, y + 0.5, w - 1, h - 1, "none", rx=rx, stroke=t["border"], cls=cls)

    def element_card(self, x, y, w, kind, label, model, lines, badge=None, cls="", placeholder=False, footer=False, gap=6):
        """An element card laid out like ElementContainer: header row, prompt box sized to its lines,
        optional footer row. Returns (height, footer_y, input_top)."""
        t = self.t
        ih = 10 + 12 * max(1, len(lines))
        h = 28 + ih + (24 if footer else 0) + 4
        self.raw("<g>" if not cls else "".join(f'<g class="{k}">' for k in cls.split()))
        self.rect(x, y, w, h, t["elcard"], rx=10, stroke=t["border"])
        pw = self.type_pill(x + 8, y + 6, kind, label)
        bx = x + 8 + pw + 6
        if model:
            bx += self.model_badge(bx, y + 6, model[0], provider=model[1]) + 4
        if badge:
            bx += self.model_badge(bx, y + 6, badge, icon_name="image") + 4
        self.icon("sliders", x + w - 26, y + 9, 12, t["muted"], opacity=0.8)
        if kind == "speech":
            self.icon("voice", x + w - 44, y + 9, 12, t["muted"], opacity=0.8)
        top = y + 28
        self.rect(x + 8, top, w - 16, ih, t["elinput"], rx=7)
        for i, ln in enumerate(lines):
            self.text(x + 16, top + 14 + i * 12, ln, 9, t["muted"] if placeholder else t["fg"])
        self.raw(f'<line x1="{x + w + 14}" y1="{y + 6}" x2="{x + w + 14}" y2="{y + h - 6}" stroke="{t["border"]}"/>')
        self.raw("</g>" * max(1, len(cls.split())))
        return h, top + ih + 4, top

    def file_image(self, name, x, y, w, h, clip, cls=""):
        """A small JPEG from assets/features/src, cropped like object-fit: cover."""
        import base64

        path = OUT / "src" / name
        data = base64.b64encode(path.read_bytes()).decode()
        uid = f"fi-{name.split('.')[0]}"
        if uid not in self._images:
            self._images.add(uid)
            self.defs.append(f'<image id="{uid}" width="16" height="9" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,{data}"/>')
        sc = max(w / 16, h / 9)
        ox, oy = x + (w - 16 * sc) / 2, y + (h - 9 * sc) / 2
        self.raw(self.wrap(f'<g clip-path="url(#{clip})"><use href="#{uid}" transform="translate({ox:.2f},{oy:.2f}) scale({sc:.4f})"/></g>', cls))

    def grain(self, x, y, w, h, rx=12, cls=""):
        """The .grain texture the app paints over raised surfaces (film grain at --grain-opacity)."""
        if "grainf" not in self._images:
            self._images.add("grainf")
            self.defs.append(
                '<filter id="grainf" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" stitchTiles="stitch"/>'
                '<feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.4 0.4 0.4 0 -0.25"/></filter>'
                '<pattern id="grainp" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" filter="url(#grainf)"/></pattern>'
            )
        op = 0.26 if self.theme == "dark" else 0.2
        self.raw(self.wrap(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="url(#grainp)" opacity="{op}"/>', cls))

    def grain_texture(self):
        """public/grain.png, the app's .grain, tiled at 50 app pixels. Returns its pattern id."""
        if "graintex" not in self._images:
            self._images.add("graintex")
            import base64
            import io

            from PIL import Image

            buf = io.BytesIO()
            Image.open(ROOT / "public" / "grain.png").save(buf, "PNG", optimize=True)
            href = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
            self.defs.append(f'<pattern id="graintex" width="25" height="25" patternUnits="userSpaceOnUse"><image width="25" height="25" href="{href}"/></pattern>')
        return "graintex"

    # .light-rays > span:nth-child(n) in app/globals.css, as (offset %, alpha) stops of each --ray
    RAYS = [
        [(0, 0), (20, 1), (36, 0), (55, 1), (67, 0.13), (78, 1), (97, 0)],
        [(11, 0), (25, 1), (41, 0.55), (67, 0.13), (78, 1), (97, 0)],
        [(9, 0), (20, 1), (28, 0.55), (40, 0.42), (48, 1), (54, 0.27), (78, 0.13), (88, 1), (97, 0)],
        [(0, 0), (17, 1), (26, 0.55), (35, 1), (47, 0), (69, 0.13), (79, 1), (97, 0)],
        [(0, 0), (20, 1), (27, 0.55), (42, 1), (48, 0), (67, 0.13), (74, 1), (82, 1), (88, 0.47), (97, 0)],
    ]

    def light_rays(self):
        """<LightRays /> as .light-rays draws it: a card-colored corner glow and five skewed ambient bands,
        with the grain overlaid, all masked to an ellipse from the top-left."""
        t = self.t
        self.defs.append(
            f'<radialGradient id="rays-fade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="{W * 1.25}" gradientTransform="scale(1,{H / (W * 1.25):.4f})">'
            '<stop offset="0" stop-color="#fff"/><stop offset=".88" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
            f'<mask id="rays-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="url(#rays-fade)"/></mask>'
            f'<radialGradient id="rays-card" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="{W}" gradientTransform="scale(1,{H / W:.4f})"><stop offset="0" stop-color="{t["card"]}"/><stop offset=".7" stop-color="{t["card"]}" stop-opacity="0"/></radialGradient>'
            f'<linearGradient id="rays-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{t["glow"]}"/><stop offset="1" stop-color="{t["glow"]}" stop-opacity="0"/></linearGradient>'
        )
        out = [f'<g mask="url(#rays-mask)" style="isolation:isolate"><rect width="{W}" height="{H}" fill="url(#rays-card)"/>']
        for i, stops in enumerate(self.RAYS):
            st = "".join(f'<stop offset="{o}%" stop-color="#fff" stop-opacity="{a}"/>' for o, a in stops)
            self.defs.append(
                f'<linearGradient id="ray{i}g" gradientUnits="userSpaceOnUse" x1="{-0.4 * W}" y1="0" x2="{1.4 * W}" y2="0">{st}</linearGradient>'
                f'<mask id="ray{i}" maskUnits="userSpaceOnUse" x="{-0.4 * W}" y="0" width="{1.8 * W}" height="{H}"><rect x="{-0.4 * W}" width="{1.8 * W}" height="{H}" fill="url(#ray{i}g)"/></mask>'
            )
            out.append(f'<g transform="translate(0,{H / 2}) skewX(45) translate(0,{-H / 2})"><rect x="{-0.4 * W}" width="{1.8 * W}" height="{H}" fill="url(#rays-v)" mask="url(#ray{i})" opacity=".22"/></g>')
        grain = 0.9 if self.theme == "dark" else 1
        out.append(f'<rect width="{W}" height="{H}" fill="url(#{self.grain_texture()})" opacity="{grain}" style="mix-blend-mode:overlay"/></g>')
        self.raw("".join(out))

    # ---- chrome shared by the cards
    def bg(self):
        t = self.t
        self.rect(0, 0, W, H, t["bg"])
        self.defs.append(
            f'<pattern id="plus" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 9v6M9 12h6" stroke="{t["dot"]}" stroke-opacity="{t["dotop"]}" stroke-width="1"/></pattern>'
        )
        self.rect(0, 0, W, H, "url(#plus)")

    def stage(self, x, y, w, h, rx=12, fill=None):
        t = self.t
        self.shadow(x, y, w, h, rx)
        self.rect(x, y, w, h, fill or t["elcard"], rx=rx, stroke=t["border"])
        self.grain(x, y, w, h, rx)

    def write(self):
        OUT.mkdir(exist_ok=True)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{html.escape(self.title)}">\n'
            f"<title>{html.escape(self.title)}</title>\n<desc>{html.escape(self.desc)}</desc>\n"
            "<style>\n" + "\n".join(self.css) + "\n</style>\n<defs>\n" + "\n".join(self.defs) + "\n</defs>\n" + "\n".join(self.body) + "\n</svg>\n"
        )
        p = OUT / f"{self.name}-{self.theme}.svg"
        p.write_text(svg)
        print(f"{p.name}  {len(svg):,} bytes")


# =====================================================================================
# 1. Describe your video — the hero composer
# =====================================================================================
def card_describe(theme):
    c = Card("describe", "Describe your video", "Sloppy greets you over the composer, the lightbulb suggests ideas, the user types one line, and Sloppy takes it from there.", 13, theme)
    t = c.t
    c.bg()
    c.light_rays()
    greeting = "What slop today, boss?"
    gw = tw(greeting, 34) * 0.86 + 40
    gx = W / 2 - gw / 2
    c.icon("robot-fill", gx, 26, 32, t["fg"])
    c.text(gx + 40, 54, greeting, 34, t["fg"], family=SERIF, extra='letter-spacing="-1.2"')

    bx, by, bw, bh = 70, 80, 500, 112
    glow = c.pulse(4, 0.45)
    c.raw(c.wrap(f'<rect x="{bx - 3}" y="{by - 3}" width="{bw + 6}" height="{bh + 6}" rx="14" fill="none" stroke="{t["glow"]}" stroke-width="6" opacity=".22" filter="url(#glow)"/>', glow))
    c.defs.append('<filter id="glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>')
    c.rect(bx, by, bw, bh, t["card"], rx=12, stroke=t["glow"], extra='stroke-opacity="0.35"')
    c.grain(bx, by, bw, bh, 12)

    # placeholder, then two lightbulb ideas, then the user's own words
    tx, ty = bx + 16, by + 26
    c.text(tx, ty, "Describe your slop or paste a script", 12.5, t["muted"], cls=c.span(0, 1.4))
    ideas = [
        ("Create a claymation children's story about Little Red Riding Hood", 1.5, 4.2),
        ("Create a documentary-style video about the rise and fall of Rome", 4.3, 7.0),
    ]
    for s, t0, t1 in ideas:
        c.text(tx, ty, s, 12.5, t["fg"], cls=c.span(t0, t1))
    c.text(tx, ty, "Describe your slop or paste a script", 12.5, t["muted"], cls=c.span(7.1, 7.9))
    user = "A street race short in neon-lit Tokyo, two rivals, 45 seconds."
    c.typewriter(tx, ty, user, 8.0, 10.4, 12.5, t["fg"], caret=True)

    # control row: Attach, then ghost setting pills, then the lightbulb and submit
    ry = by + bh - 32
    c.icon("plus", bx + 14, ry + 6, 12, t["fg"])
    px = bx + 34

    def ghost(label, icon=None, mark=None):
        x0 = px
        x = x0 + 6
        if icon:
            c.icon(icon, x, ry + 6, 11, t["fg"])
            x += 15
        if mark:
            c.provider_mark(mark, x, ry + 6.5, 10)
            x += 14
        c.text(x, ry + 15, label, 9.5, t["fg"], weight=500)
        x += tw(label, 9.5, 500) + 3
        c.icon("chevron-down", x, ry + 8, 8, t["muted"])
        return x + 14 - x0

    for label, icon, mark in (("16:9", "aspect-ratio", None), ("Auto", "film-slate", None), ("Auto", "translate", None), ("Claude Opus 5.5", None, "openslop"), ("Auto", "hour-glass", None)):
        px += ghost(label, icon, mark) + 2
    # the lightbulb gets clicked twice, then submit lights up once there is text
    lbx, sbx = bx + bw - 56, bx + bw - 30
    for at in (1.4, 4.2):
        c.rect(lbx - 3, ry + 1, 20, 20, t["hover"], rx=6, cls=c.span(at, at + 0.35, fade=0.1))
    c.icon("lightbulb", lbx, ry + 4, 14, t["fg"])
    c.icon("corner-down-left", sbx, ry + 4, 14, t["fg"], opacity=0.35, cls=c.span(0, 8.0))
    c.icon("corner-down-left", sbx, ry + 4, 14, t["fg"], cls=c.span(8.0, 13))
    pressed = c.span(10.9, 11.3, fade=0.1)
    c.rect(sbx - 3, ry + 1, 20, 20, t["hover"], rx=6, cls=pressed)
    # Sloppy picks it up
    took = c.appear(11.4, dy=3)
    c.orb(W / 2 - 46, by + bh + 13, 16, cls=took)
    c.text(W / 2 - 26, by + bh + 25, "Slopping… · 1s", 10, t["muted"], cls=took)

    c.text(W / 2, by + bh + 26, "Skip to a blank canvas", 10, t["muted"], anchor="middle", weight=500, cls=c.span(0, 11.4))

    # Need inspiration? two real templates
    gy = 256
    c.text(W / 2, gy, "Need inspiration?", 10, t["muted"], anchor="middle")
    cards = [
        ("POV Your Life as A...", "Second-person POV voiceover with…", "POV Life", "#F59E0B", "template-pov-life.jpg"),
        ("Get Sleepy with...", "Slow, soothing narration to lull…", "Sleep Story", "#6366F1", "template-sleep-story.jpg"),
    ]
    for i, (title, desc, name, col, img) in enumerate(cards):
        x = 90 + i * 236
        y = gy + 10
        c.rect(x, y, 224, 60, t["card"], rx=10, stroke=t["border"])
        c.defs.append(f'<clipPath id="tplc{i}"><path d="M{x + 10} {y}h36v60h-36a10 10 0 0 1 -10 -10v-40a10 10 0 0 1 10 -10z"/></clipPath>')
        c.file_image(img, x, y, 46, 60, clip=f"tplc{i}")
        c.defs.append(f'<clipPath id="tplt{i}"><rect x="{x + 56}" y="{y}" width="{224 - 56 - 12}" height="60"/></clipPath>')
        c.raw(f'<g clip-path="url(#tplt{i})">')
        c.text(x + 56, y + 18, title, 11, t["fg"], weight=600)
        c.text(x + 56, y + 33, desc, 8.5, t["muted"])
        c.raw("</g>")
        c.icon("chevron-right", x + 206, y + 9, 10, t["muted"])
        c.pill(x + 56, y + 40, name, 8, col, "#ffffff", h=13, pad=5, weight=500)
    c.write()


# =====================================================================================
# 2. Sloppy — the copilot in the left panel
# =====================================================================================
KIND_ICON = {"speech": "voice", "image": "image", "video": "video", "sound": "wave-sine", "music": "music"}


def card_sloppy(theme):
    c = Card("sloppy", "Sloppy, the copilot", "A request goes into the Sloppy panel; it thinks, reads, outlines, writes the script, fits the videos, and the scenes land on the canvas as it works.", 14, theme)
    t = c.t
    c.bg()
    # rail
    groups = [["folder-open", "Assets"], ["stock-alt", "Media"], ["text-box", "Captions"], ["layout", "Layout"], ["sliders-alt", "Properties"], ["magic", "Effects"], ["insert-element", "Models"], ["history", "History"], ["info", "Project"]]
    rail = [("home", "Home", 12)] + [(ic, lab, 54 + i * 26) for i, (ic, lab) in enumerate(groups)]
    c.raw(f'<line x1="6" y1="44.5" x2="46" y2="44.5" stroke="{t["border"]}"/>')
    c.raw(f'<line x1="6" y1="296.5" x2="46" y2="296.5" stroke="{t["border"]}"/>')
    for ic, lab, y in rail:
        c.icon(ic, 20, y, 12, t["muted"])
        c.text(26, y + 21, lab, 6.5, t["muted"], anchor="middle", weight=500)
    c.rect(6, 304, 40, 44, t["secondary"], rx=10)
    c.icon("robot-fill", 19, 312, 14, t["panellabel"])
    c.text(26, 338, "Sloppy", 7.5, t["panellabel"], anchor="middle", weight=600)

    # panel column
    PX, PW = 58, 240
    c.icon("robot-fill", PX, 12, 15, t["panellabel"])
    c.text(PX + 21, 24, "Sloppy", 13, t["panellabel"], weight=600)

    ub = c.appear(0.6)
    c.raw(c.wrap(f'<path d="M{PX + 58} 38h{PW - 58}a10 10 0 0 1 10 10v20a3 3 0 0 1 -3 3h-{PW - 58 - 3}a10 10 0 0 1 -10 -10v-13a10 10 0 0 1 10 -10z" fill="{t["primary"]}"/>', ub))
    c.text(PX + 70, 53, "a street race short, 45 seconds,", 10, t["primaryfg"], cls=ub)
    c.text(PX + 70, 66, "two rivals, neon-lit tokyo", 10, t["primaryfg"], cls=ub)

    def status(y, t0, t1, label):
        s = c.span(t0, t1, fade=0.1)
        c.orb(PX, y - 11, 16, cls=s)
        c.text(PX + 19, y, label, 9.5, t["muted"], cls=s + " " + c.pulse(1.6, 0.55))

    def step(y, t0, icon, label):
        a = c.appear(t0)
        c.icon("chevron-right", PX + 2, y - 8, 8, t["muted"], cls=a)
        c.icon(icon, PX + 13, y - 9, 10, t["muted"], cls=a)
        c.text(PX + 28, y, label, 9.5, t["fg"], cls=a)

    def outcome(y, t0, s):
        a = c.appear(t0, dy=2)
        c.raw(c.wrap(f'<line x1="{PX + 8}" y1="{y - 9}" x2="{PX + 8}" y2="{y + 3}" stroke="{t["border2"]}"/>', a))
        c.text(PX + 16, y, s, 8.5, t["muted"], cls=a, extra='opacity="0.8"')

    status(96, 1.2, 2.0, "Slopping… · 1s")
    th = c.appear(2.0)
    c.icon("chevron-right", PX + 2, 88, 8, t["muted"], cls=th)
    c.icon("magic", PX + 13, 87, 10, t["muted"], cls=th)
    c.text(PX + 28, 96, "Thinking…", 9.5, t["fg"], cls=c.span(2.0, 3.3) + " " + c.pulse(1.2, 0.5))
    c.text(PX + 28, 96, "Done thinking", 9.5, t["fg"], cls=c.span(3.35, 14))
    status(114, 2.0, 3.5, "Slopping… · 2s")
    step(114, 3.5, "eye", "Reading the script")
    outcome(128, 3.7, "The script is empty.")
    status(146, 3.5, 4.6, "Slopping… · 4s")
    step(146, 4.6, "pencil", "Outlining the story")
    outcome(160, 4.9, "Three scenes: the street, the rivals, the drift.")
    status(178, 4.6, 5.8, "Slopping… · 5s")
    step(178, 5.8, "film", "Writing a new script")
    outcome(192, 8.4, "Wrote 3 scenes with 11 elements.")
    status(210, 5.8, 8.8, "Applying changes · 8s")
    step(210, 8.8, "hour-glass", "Fitting video elements to the speech")
    outcome(224, 9.1, "Trimmed 2 visuals to their speech.")
    status(242, 8.8, 10.2, "Slopping… · 11s")
    rp = c.appear(10.2)
    c.rect(PX, 232, PW, 48, t["elcard"], rx=10, cls=rp)
    c.grain(PX, 232, PW, 48, 10, cls=rp)
    c.text(PX + 10, 247, "on it boss! neon drift is on the canvas,", 9.5, t["fg"], cls=rp)
    c.text(PX + 10, 259, "three scenes with takeshi and ryu. hit", 9.5, t["fg"], cls=rp)
    c.text(PX + 10, 271, "generate all whenever you're ready", 9.5, t["fg"], cls=rp)
    wk = c.appear(10.8)
    c.icon("magic", PX + 3, 286, 10, t["muted"], cls=wk)
    c.text(PX + 18, 295, "Worked for 12s", 9, t["muted"], cls=wk)

    # composer
    cy = 306
    c.shadow(PX, cy, PW, 44, 10, 0.5)
    c.rect(PX, cy, PW, 44, t["elcard"], rx=10)
    c.grain(PX, cy, PW, 44, 10)
    c.text(PX + 10, cy + 15, "Write or change the script…", 9.5, t["muted"])
    c.provider_mark("openslop", PX + 10, cy + 26, 10)
    c.text(PX + 24, cy + 34.5, "Claude Opus 5.5", 9, t["muted"])
    c.icon("chevron-down", PX + 24 + tw("Claude Opus 5.5", 9) + 6, cy + 27, 8, t["muted"])
    c.icon("lightbulb", PX + 24 + tw("Claude Opus 5.5", 9) + 22, cy + 25, 11, t["muted"])
    c.rect(PX + PW - 30, cy + 20, 20, 20, t["secondary"], rx=6)
    c.icon("corner-down-left", PX + PW - 27, cy + 23, 14, t["accent"], opacity=0.4)

    # the canvas on the right, filling in as the script streams
    SX, SY, SW, SH = 312, 8, 320, 344
    c.stage(SX, SY, SW, SH)
    c.text(SX + 14, SY + 30, "Start typing your story…", 10, t["muted"], cls=c.span(0, 5.9))
    c.text(SX + 14, SY + 30, "Neon Drift", 15, t["fg"], weight=600, cls=c.appear(6.0))

    def scene_head(y, n, rng, dur, t0):
        a = c.appear(t0)
        c.icon("chevron-down", SX + 12, y - 9, 10, t["muted"], cls=a)
        c.text(SX + 26, y, f"Scene {n}", 9, t["muted"], weight=500, cls=a)
        c.text(SX + 68, y, rng, 9, t["muted"], cls=a)
        c.rect(SX + 124, y - 9, 22, 12, t["secondary"], rx=3, cls=a)
        c.text(SX + 135, y, dur, 8, t["muted"], anchor="middle", cls=a)

    def compact(y, kind, s, t0):
        a = c.appear(t0)
        c.rect(SX + 14, y - 11, 16, 16, t["secondary"], rx=4, cls=a)
        c.icon(KIND_ICON[kind], SX + 17, y - 8, 10, t["m_" + kind], cls=a)
        c.text(SX + 36, y, s, 9, t["muted"], cls=a)

    scene_head(SY + 56, 1, "0:00 – 0:12", "12s", 6.2)
    compact(SY + 76, "image", "A neon-lit tokyo street after rain. Signage…", 6.4)
    compact(SY + 96, "speech", "The engine caught on the second turn.", 6.9)
    compact(SY + 116, "music", "Epic orchestral with aggressive taiko drums…", 7.4)
    c.raw(c.wrap(f'<line x1="{SX + 14}" y1="{SY + 132}" x2="{SX + SW - 14}" y2="{SY + 132}" stroke="{t["border"]}"/>', c.appear(7.8)))
    scene_head(SY + 152, 2, "0:12 – 0:26", "14s", 7.8)
    compact(SY + 172, "video", "Ryu steps out of the silvia, rain on the…", 8.0)
    compact(SY + 192, "speech", "Ryu: “Tonight we settle this. No rules.”", 8.3)
    compact(SY + 212, "speech", "Takeshi: “Then keep up.”", 8.6)
    c.raw(c.wrap(f'<line x1="{SX + 14}" y1="{SY + 228}" x2="{SX + SW - 14}" y2="{SY + 228}" stroke="{t["border"]}"/>', c.appear(8.9)))
    scene_head(SY + 248, 3, "0:26 – 0:38", "12s", 8.9)
    compact(SY + 268, "video", "Slow motion on the drift, smoke billowing…", 9.1)
    compact(SY + 288, "sound", "tyre screech", 9.4)
    compact(SY + 308, "speech", "The rear wheels broke loose.", 9.7)
    c.text(SX + 36, SY + 328, "+2 more", 8, t["muted"], cls=c.appear(9.9))
    c.write()


# =====================================================================================
# 3. The storyboard canvas — scenes, elements, the seven types
# =====================================================================================
def card_canvas(theme):
    c = Card("canvas", "A storyboard you can edit", "A scene holds element cards; hovering a row shows the insert control, its menu lists the five element types, and a new Sound card appears where it was picked.", 12, theme)
    t = c.t
    c.bg()
    SX, SY, SW, SH = 8, 8, 624, 344
    c.stage(SX, SY, SW, SH)
    c.text(SX + 40, SY + 26, "Neon Drift", 15, t["fg"], weight=600)

    # assets row
    ay = SY + 36
    tiles = [("Art style", "theme-swatches", None), ("Takeshi", None, "takeshi"), ("Ryu", None, "ryu"), ("Add asset", "plus", "+")]
    for i, (lab, ic, img) in enumerate(tiles):
        x = SX + 40 + i * 40
        y = ay - 2
        dashed = img == "+"
        if img and not dashed:
            c.image(img, x, y, 30, 30, rx=6)
        else:
            c.rect(x, y, 30, 30, t["secondary"] if dashed else t["card"], rx=6, stroke=t["border2"], extra='stroke-dasharray="3 2"' if dashed else "")
            if dashed:
                c.icon(ic, x + 8, y + 8, 14, t["muted"])
            else:
                c.icon(ic, x + 8, y + 8, 14, t["muted"])
        c.text(x + 15, y + 39, lab, 7, t["muted"], anchor="middle")

    # scene header
    sy = SY + 100
    c.icon("chevron-down", SX + 40, sy - 8, 10, t["muted"])
    c.text(SX + 54, sy, "Scene 1", 9, t["muted"], weight=500)
    c.text(SX + 96, sy, "0:00 – 0:12", 9, t["muted"])
    c.rect(SX + 152, sy - 9, 22, 12, t["secondary"], rx=3)
    c.text(SX + 163, sy, "12s", 8, t["muted"], anchor="middle")
    for i, ic in enumerate(("magic", "play", "trash")):
        c.rect(SX + SW - 100 + i * 26, sy - 12, 20, 20, t["secondary"], rx=6, opacity=0.6)
        c.icon(ic, SX + SW - 96 + i * 26, sy - 8, 12, t["muted"], opacity=0.7)

    CX, CW = SX + 40, 330
    COLX = CX + CW + 22
    COLW = SX + SW - 14 - COLX
    PXX = COLX + (COLW - 200) / 2  # audio boxes are 200 wide

    y1 = SY + 110
    h1, _, _ = c.element_card(CX, y1, CW, "image", "Image", ("Seedream 5 Lite", "runware"), ["A neon-lit tokyo street after rain. Signage in every", "colour reflects off the asphalt toward the overpass."])
    iw = (h1 - 4) * 16 / 9
    c.image("city0", COLX + (COLW - iw) / 2, y1 + 2, iw, h1 - 4, rx=6)
    y2 = y1 + h1 + 6
    h2, _, top2 = c.element_card(CX, y2, CW, "speech", "Speech", None, ["The engine caught on the second turn."])
    c.rect(PXX, y2 + 3, 200, h2 - 6, t["elcard"], rx=6, stroke=t["border"])
    c.icon("play", PXX + 8, y2 + h2 / 2 - 7, 14, t["fg"])
    c.waveform(PXX + 28, y2 + h2 / 2 - 11, 124, 22, t["muted"], seed=2)
    c.text(PXX + 192, y2 + h2 / 2 + 3, "0:00/0:03", 7.5, t["muted"], anchor="end")
    y3 = y2 + h2 + 6

    # hover gutter on the speech row → insert menu → Sound
    hv = c.span(3.0, 5.9)
    c.icon("plus", SX + 15, y2 + 6, 16, t["muted"], cls=hv)
    c.raw(c.wrap(f'<g color="{t["muted"]}" transform="translate({SX + 17},{y2 + 24}) scale(0.8)"><circle cx="5" cy="4" r="1.3" fill="currentColor"/><circle cx="11" cy="4" r="1.3" fill="currentColor"/><circle cx="5" cy="9" r="1.3" fill="currentColor"/><circle cx="11" cy="9" r="1.3" fill="currentColor"/><circle cx="5" cy="14" r="1.3" fill="currentColor"/><circle cx="11" cy="14" r="1.3" fill="currentColor"/></g>', hv))
    menu = c.span(3.8, 5.8, fade=0.1)
    mx, my = SX + 30, y2 + 28
    c.shadow(mx, my, 132, 111, 8, 0.8, cls=menu)
    c.rect(mx, my, 132, 111, t["card"], rx=8, stroke=t["border"], cls=menu)
    types = [("speech", "Speech"), ("image", "Image"), ("video", "Video"), ("sound", "Sound"), ("music", "Music")]
    for i, (k, lab) in enumerate(types):
        ry = my + 6 + i * 17
        if k == "sound":
            c.rect(mx + 4, ry - 1, 124, 16, t["secondary"], rx=4, cls=c.span(5.0, 5.8, fade=0.1))
        c.rect(mx + 8, ry + 1, 12, 12, mix(t["card"], t["m_" + k], 0.15), rx=3, cls=menu)
        c.icon(KIND_ICON[k], mx + 10, ry + 3, 8, t["m_" + k], cls=menu)
        c.text(mx + 26, ry + 11, lab, 9, t["fg"], cls=menu)
    cur = c.span(3.0, 5.8, fade=0.1) + " " + c.shift(4.2, dx=52, dy=108, dur=0.7)
    c.raw(c.wrap(f'<path transform="translate({SX + 20},{y2 + 12})" d="M0 0l0 14 4-3.5 2.6 5.6 2.4-1.1-2.6-5.6h5z" fill="{t["fg"]}" stroke="{t["bg"]}" stroke-width="1"/>', cur))

    # the new Sound card, with its footer, below the row that was hovered
    ys = y3
    grp = c.appear(6.0)
    hs, fy, tops = c.element_card(CX, ys, CW, "sound", "Sound", ("Eleven Text to Sound v2", "elevenlabs"), [""], cls=grp, footer=True)
    c.text(CX + 16, tops + 14, "Describe the sound effect...", 9, t["muted"], cls=c.span(6.0, 7.0, fade=0.05))
    c.typewriter(CX + 16, tops + 14, "tyre screech, long and close", 7.1, 8.4, 9, t["fg"], cls=grp)
    c.button(CX + CW - 8 - 64, fy, "Generate", icon="magic", h=18, size=8.5, pad=7, cls=grp)
    c.audio_placeholder(PXX, ys + (hs - 40) / 2, 200, 40, cls=grp, animate=False, seed=6)
    c.write()


# =====================================================================================
# 4. Generate everything — the queue, dependencies, and stale detection
# =====================================================================================
def card_generate(theme):
    c = Card("generate", "One click generates everything", "Generate all queues every element, runs dependencies first, fills in previews, then flags an edited prompt as stale with a reason.", 14, theme)
    t = c.t
    c.bg()
    c.raw(f'<line x1="0" y1="34.5" x2="{W}" y2="34.5" stroke="{t["border"]}"/>')
    c.icon("lock", 258, 11, 11, t["muted"])
    c.text(273, 21, "Personal", 10, t["muted"])
    c.text(322, 21, "/", 10, t["faint"])
    c.text(330, 21, "Neon Drift", 10, t["fg"], weight=500)
    c.button(566, 6, "Export", icon="download", variant="panel", size=9.5, h=22, pad=8)
    states = [(0, 1.2, "Generate 7 elements", "magic", False), (1.2, 8.2, "Generating…", "spinner", True), (8.2, 10.4, "All generated", "check", False), (10.4, 14, "Regenerate 1 element", "magic", False)]
    for t0, t1, lab, ic, spin in states:
        s = c.span(t0, t1, fade=0.08)
        w = 18 + tw(lab, 9.5, 500) + 17.5
        x = 558 - w
        cx = x - (30 if spin else 6)
        bw_ = 22 + tw("$4.20", 9.5, 500)
        c.pill(cx - bw_, 6, "$4.20", 9.5, t["secondary"], t["fg"], icon="credit-card", h=22, pad=7, cls=s)
        c.button(x, 6, lab, icon=ic, size=9.5, h=22, pad=9, cls=s, icon_cls=(s + " " + c.spin(1.0)) if spin else s)
        if spin:
            c.raw(c.wrap(f'<circle cx="{x - 16}" cy="17" r="10" fill="{t["secondary"]}"/>', s))
            c.icon("x", x - 21, 12, 10, t["muted"], cls=s)
        if t0 == 0:
            c.rect(x - 2, 4, w + 4, 26, "none", rx=8, stroke=t["accent"], sw=1.5, cls=c.span(0.9, 1.3, fade=0.1))

    SX, SY, SW, SH = 8, 44, 624, 308
    c.stage(SX, SY, SW, SH)
    sy = SY + 22
    c.icon("chevron-down", SX + 14, sy - 8, 10, t["muted"])
    c.text(SX + 28, sy, "Scene 3", 9, t["muted"], weight=500)
    c.text(SX + 70, sy, "0:26 – 0:38", 9, t["muted"])
    c.rect(SX + 126, sy - 9, 22, 12, t["secondary"], rx=3)
    c.text(SX + 137, sy, "12s", 8, t["muted"], anchor="middle")

    CX, CW = SX + 14, 362
    COLX = CX + CW + 24
    COLW = SX + SW - 14 - COLX
    rows = [
        ("video", "Video", ("Seedance 2 Fast", "runware"), None, ["Slow motion on the drift, smoke billowing off the", "rear tyres as the car swings back into line."], "media"),
        ("speech", "Speech", None, None, ["The rear wheels broke loose. Takeshi kept the", "wheel light and let the silvia swing."], "audio"),
        ("sound", "Sound", ("Eleven Text to Sound v2", "elevenlabs"), None, ["tyre screech, long and close"], "audio"),
    ]
    timing = {"video": (1.6, 6.8), "speech": (1.6, 4.6), "sound": (4.6, 7.6)}
    y = SY + 34
    for kind, label, model, badge, lines, pk in rows:
        h, fy, top = c.element_card(CX, y, CW, kind, label, model, lines, badge=badge, footer=True)
        if kind == "video":
            # the second line is retyped late in the loop with an edit on the end
            ln = lines[1]
            c.rect(CX + 8, top + 18, CW - 16, 13, t["elinput"])
            c.text(CX + 16, top + 26, ln, 9, t["fg"], cls=c.span(0, 10.0, fade=0))
            c.typewriter(CX + 16, top + 26, ln[:-1] + " under the overpass.", 10.0, 10.5, 9, t["fg"], start=len(ln) - 1, cls=c.span(10.0, 14, fade=0))
        g0, g1 = timing[kind]
        fx = CX + CW - 8
        for t0, t1, lab, ic, spin in ((0, 1.3, "Generate", "magic", False), (1.3, g0, "Queued", "hour-glass", False), (g0, g1, "Generating…", "spinner", True), (g1, 14, "Regenerate", "magic", False)):
            if t1 <= t0:
                continue
            s = c.span(t0, t1, fade=0.08)
            bw = tw(lab, 8.5, 500) + 14 + 16.5
            c.button(fx - bw, fy, lab, icon=ic, h=18, size=8.5, pad=7, cls=s, icon_cls=(s + " " + c.spin(1.0)) if spin else s)
        if kind == "video":
            st = c.appear(10.6)
            rw = tw("Regenerate", 8.5, 500) + 14 + 16.5
            bx = fx - rw - 6 - (tw("Stale", 9, 500) + 12 + 14)
            bw = c.badge(bx, fy + 1, "Stale", "tertiary", icon="alert-filled", cls=st)
            tip = c.span(11.0, 13.6)
            msg = "The prompt changed — regenerate to update"
            tipw = tw(msg, 8.5) + 22
            tx = bx - tipw - 12
            c.rect(tx, fy, tipw, 18, t["fg"], rx=5, cls=tip)
            c.raw(c.wrap(f'<path d="M{tx + tipw} {fy + 5}l4 4-4 4z" fill="{t["fg"]}"/>', tip))
            c.text(tx + 8, fy + 12.3, msg, 8.5, t["bg"], cls=tip)
        if pk == "media":
            pw, ph = 150, 84
            PXX = COLX + (COLW - pw) / 2
            c.media_placeholder(PXX, y + 2, pw, ph, cls=c.span(0, g1, fade=0.3), animate=True, seed=5)
            done = c.appear(g1, dy=0, fade=0.5)
            c.image("smoke0", PXX, y + 2, pw, ph, rx=6, cls=done)
            c.rect(PXX + pw - 62, y + 6, 58, 14, t["onmedia"], rx=4, opacity=0.6, cls=done)
            c.text(PXX + pw - 48, y + 16, "Video", 7.5, "#ffffff", anchor="middle", weight=500, cls=done)
            c.text(PXX + pw - 19, y + 16, "Still", 7.5, "#ffffff", anchor="middle", weight=500, cls=done, extra='opacity="0.6"')
        else:
            pw, ph = 200, 40
            PXX = COLX + (COLW - pw) / 2
            py = y + (h - ph) / 2
            c.audio_placeholder(PXX, py, pw, ph, cls=c.span(0, g1, fade=0.3), animate=True, seed=7 if kind == "sound" else 3)
            done = c.appear(g1, dy=0, fade=0.4)
            c.rect(PXX, py, pw, ph, t["elcard"], rx=6, stroke=t["border"], cls=done)
            c.icon("play", PXX + 8, py + 13, 14, t["fg"], cls=done)
            c.waveform(PXX + 28, py + 8, 124, 24, t["m_" + kind], seed=3 if kind == "sound" else 7, cls=done, opacity=0.85)
            c.text(PXX + 192, py + 24, "0:00/0:05" if kind == "speech" else "0:00/0:02", 7.5, t["muted"], anchor="end", cls=done)
        chip_x, chip_y = PXX + 6, (y + 8 if pk == "media" else y + (h - 40) / 2 + 10)
        q = c.span(1.3, g0, fade=0.05)
        qw = 19 + tw("Queued…", 7.5, 500) + 8
        c.rect(chip_x, chip_y, qw, 20, t["onmedia"], rx=10, opacity=0.55, cls=q)
        c.icon("hour-glass", chip_x + 5, chip_y + 5, 10, "#ffffff", cls=q + " " + c.pulse(1.2, 0.5))
        c.text(chip_x + 19, chip_y + 13.5, "Queued…", 7.5, "#ffffff", weight=500, cls=q)
        gen = c.span(g0, g1, fade=0.05)
        gw = 19 + tw("Generating 9s", 7.5, 500) + 8
        c.rect(chip_x, chip_y, gw, 20, t["onmedia"], rx=10, opacity=0.55, cls=gen)
        c.icon("spinner", chip_x + 5, chip_y + 5, 10, "#ffffff", cls=gen + " " + c.spin(1.0))
        for i in range(int(g1 - g0)):
            c.text(chip_x + 19, chip_y + 13.5, f"Generating {i + 1}s", 7.5, "#ffffff", cls=c.span(g0 + i, g0 + i + 1, fade=0.0), weight=500)
        y += h + 6
    c.write()


# =====================================================================================
# 5. Player and timeline
# =====================================================================================
def card_timeline(theme):
    c = Card("timeline", "Player and timeline", "The player plays the cut with word-by-word captions while the playhead sweeps a timeline of caption, visual, speech, effects, and music clips.", 12, theme)
    t = c.t
    c.bg()
    c.stage(8, 8, 624, 344)
    vw, vh = 232, 130
    vx, vy = (W - vw) / 2, 14
    c.rect(vx - 1, vy - 1, vw + 2, vh + 2, t["card"], rx=7, stroke=t["border"])
    scenes = [(0, 4, "city0"), (4, 7, "conf1"), (7, 10, "drift2"), (10, 12, "smoke0")]
    for a, b, im in scenes:
        c.image(im, vx, vy, vw, vh, rx=6, cls=c.span(a, b, fade=0.4), stroke=False)
    lines = [((0, 4), ["The", "engine", "caught", "on", "the", "second", "turn."]), ((4, 7), ["Tonight", "we", "settle", "this.", "No", "rules."]), ((7, 10), ["The", "rear", "wheels", "broke", "loose."]), ((10, 12), ["Smoke", "off", "the", "rear", "tyres."])]
    for (a, b), words in lines:
        per = (b - a - 0.6) / len(words)
        spans = "".join(f'<tspan class="{c.span(a + i * per, b, fade=0.05)}">{html.escape(wd)}{" " if i < len(words) - 1 else ""}</tspan>' for i, wd in enumerate(words))
        c.raw(f'<text x="{W / 2}" y="{vy + vh - 12}" font-family="{SANS}" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" stroke="#000000" stroke-width="2.2" paint-order="stroke fill" stroke-linejoin="round" style="white-space:pre">{spans}</text>')

    # transport bar
    ty = 156
    segs = [4, 3, 3, 2]
    total = sum(segs)
    bx, bw = 20, 600
    c.defs.append('<clipPath id="segs">' + "".join(f'<rect x="{bx + sum(segs[:i]) / total * bw + (1 if i else 0)}" y="{ty}" width="{s / total * bw - (2 if i < 3 else 1)}" height="4" rx="2"/>' for i, s in enumerate(segs)) + "</clipPath>")
    c.raw(f'<g clip-path="url(#segs)"><rect x="{bx}" y="{ty}" width="{bw}" height="4" fill="{t["scrubtrack"]}"/><rect class="{c.grow(0, 12)}" x="{bx}" y="{ty}" width="{bw}" height="4" fill="{t["scrubprog"]}"/></g>')
    c.raw(f'<g class="{c.slide(0, 12, bw)}"><circle cx="{bx}" cy="{ty + 2}" r="4" fill="{t["scrubprog"]}" stroke="{t["border2"]}" stroke-width="1.5"/></g>')
    ry = ty + 20
    for s in range(12):
        c.text(bx, ry, f"0:{s:02d}", 9.5, t["fg"], cls=c.span(s, s + 1, fade=0), weight=500)
    c.text(bx + tw("0:00", 9.5, 500) + 3, ry, "/ 0:12", 9.5, t["muted"])
    for (a, b, _), n in zip(scenes, (1, 2, 3, 4)):
        s = c.span(a, b, fade=0)
        c.rect(bx + 66, ry - 10, 44, 14, t["secondary"], rx=3, stroke=t["border"], cls=s)
        c.text(bx + 88, ry, f"Scene {n}", 8.5, t["fg"], anchor="middle", cls=s)
    c.icon("chevrons-left", W / 2 - 34, ry - 11, 13, t["fg"])
    c.icon("pause", W / 2 - 6, ry - 11, 13, t["fg"])
    c.icon("chevrons-right", W / 2 + 21, ry - 11, 13, t["fg"])
    c.icon("minus", 434, ry - 10, 11, t["fg"])
    c.text(460, ry, "100%", 9, t["fg"], anchor="middle", weight=500)
    c.icon("plus", 476, ry - 10, 11, t["fg"])
    c.icon("volume-2", 498, ry - 11, 13, t["fg"])
    c.rect(515, ry - 5, 28, 2, t["scrubtrack"], rx=1)
    c.rect(515, ry - 5, 20, 2, t["scrubprog"], rx=1)
    c.icon("maximize", 550, ry - 11, 13, t["fg"])
    c.rect(568, ry - 14, 54, 19, t["recessed"], rx=5)
    c.rect(570, ry - 12, 16, 15, t["card"], rx=4)
    for i, name in enumerate(("timeline", "expand-timeline", "collapse-timeline")):
        c.icon(name, 572 + i * 17, ry - 10, 11, t["fg"] if i == 0 else t["muted"])

    # timeline
    TY = 194
    gx, GW = 20, 0
    lx = gx + GW
    LW = 600 - GW
    pps = (LW - 16) / total
    c.raw(f'<line x1="{gx}" y1="{TY + 0.5}" x2="620" y2="{TY + 0.5}" stroke="{t["border"]}"/>')
    RH = 20
    for s in range(0, total * 5 + 1):
        c.raw(f'<circle cx="{lx + s * pps / 5:.1f}" cy="{TY + RH - 4}" r="0.8" fill="{t["border2"]}"/>')
    for s in range(0, total + 1, 2):
        x = lx + s * pps
        c.text(x if s else x + 1, TY + 12, f"0:{s:02d}", 8, t["muted"], anchor="middle" if s else "start")
    c.raw(f'<line x1="{lx}" y1="{TY + RH + 0.5}" x2="620" y2="{TY + RH + 0.5}" stroke="{t["border"]}"/>')
    lanes = [("captions", 14), ("film", 40), ("voice", 30), ("wave-sine", 26), ("music", 26)]
    ly = TY + RH + 1
    lane_y = {}
    for name, h in lanes:
        lane_y[name] = ly
        c.raw(f'<line x1="{gx}" y1="{ly + h + 0.5}" x2="620" y2="{ly + h + 0.5}" stroke="{t["border"]}" stroke-opacity="0.6"/>')
        ly += h + 1

    def clip(lane, a, b, kind, label, scene=None, art=None, wave_seed=None):
        y = lane_y[lane]
        h = dict(lanes)[lane]
        x = lx + a * pps
        w = (b - a) * pps - 2
        tint = t["m_" + kind]
        c.rect(x, y + 2, w, h - 4, mix(t["elcard"], tint, 0.22), rx=4, stroke=t["border"])
        c.icon(KIND_ICON[kind], x + 4, y + 5, 8, tint)
        maxc = max(4, int((w - 18) / 4.6))
        lab = label if len(label) <= maxc else label[: max(2, maxc // 2 - 1)] + "…" + label[-(maxc // 2 - 1) :]
        c.text(x + 15, y + 12, lab, 7, t["fg"])
        by = y + 16
        bh = h - 20
        c.rect(x + 2, by, w - 4, bh, mix(t["elcard"], tint, 0.06), rx=2)
        if art:
            c.image(art, x + 2, by, bh * 16 / 9, bh, rx=2, stroke=False)
        if wave_seed is not None:
            c.waveform(x + 6, by + 2, w - 12, bh - 4, tint, seed=wave_seed, opacity=0.9)
        if scene:
            c.rect(x + 2, y + h - 12, 34, 10, t["onmedia"], rx=2, opacity=0.65)
            c.text(x + 19, y + h - 4.5, f"Scene {scene}", 6.5, "#ffffff", anchor="middle", weight=500)

    for (a, b), words in lines:
        x = lx + a * pps
        c.rect(x, lane_y["captions"] + 2, (b - a) * pps - 2, 10, t["secondary"], rx=3, stroke=t["border"])
        c.text(x + 4, lane_y["captions"] + 9.5, " ".join(words), 6.5, t["fg"])
    clip("film", 0, 4, "image", "A neon-lit tokyo street", 1, "city0")
    clip("film", 4, 7, "video", "Ryu steps out of the silvia", 2, "conf1")
    clip("film", 7, 10, "video", "Sideways through the corner", 3, "drift2")
    clip("film", 10, 12, "video", "Slow-mo, smoke off the tyres", 4, "smoke0")
    clip("voice", 0, 3.6, "speech", "The engine caught…", wave_seed=2)
    clip("voice", 4, 6.6, "speech", "Ryu: Tonight we settle this", wave_seed=6)
    clip("voice", 7, 9.6, "speech", "The rear wheels broke loose", wave_seed=4)
    clip("voice", 10, 12, "speech", "Smoke off the tyres", wave_seed=8)
    clip("wave-sine", 4.3, 5.4, "sound", "Handbrake", wave_seed=9)
    clip("wave-sine", 7.2, 9.8, "sound", "tyre screech", wave_seed=11)
    clip("music", 0, 12, "music", "Epic orchestral with aggressive taiko drums and a screeching electric guitar", wave_seed=5)
    ph = c.slide(0, 12, total * pps)
    c.raw(f'<g class="{ph}"><line x1="{lx + 0.5}" y1="{TY}" x2="{lx + 0.5}" y2="{ly}" stroke="{t["scrubprog"]}"/><path transform="translate({lx - 4},{TY})" d="M8 1v5L4.5 10 1 6V1h7z" fill="{t["scrubprog"]}"/></g>')
    c.write()


# =====================================================================================
# 6. Bring your own keys — Settings › Models › Providers
# =====================================================================================
def card_providers(theme):
    c = Card("providers", "Bring your own keys", "In Settings, a Cartesia key is pasted and validated: the badge goes Unverified, then Connected, next to OpenSlop's hosted models and an Anthropic key.", 12, theme)
    t = c.t
    c.bg()
    c.rect(0, 0, W, H, "#000000", opacity=0.35)
    P = 16  # the dialog's padding and the pane's inner padding
    DX, DY, DW, DH = 60, 16, 520, 328
    c.shadow(DX, DY, DW, DH, 8, 1.2)
    c.rect(DX, DY, DW, DH, t["recessed"], rx=8, stroke=t["border"])
    c.grain(DX, DY, DW, DH, 8)
    c.text(DX + P, DY + P + 8, "Settings", 11, t["fg"], weight=600)
    c.icon("x", DX + DW - P - 12, DY + P, 12, t["muted"])
    # nav
    NX, NW = DX + P, 104
    NY = DY + P + 24
    c.text(NX + 8, NY + 11, "Account", 10, t["fg"], weight=600)
    c.rect(NX, NY + 22, NW, 22, t["card"], rx=5)
    c.icon("link", NX + 8, NY + 27.5, 11, t["fg"])
    c.text(NX + 24, NY + 36.5, "Models", 10, t["fg"], weight=500)
    # pane
    RX, RY = NX + NW + 12, NY
    RW, RH = DX + DW - P - RX, DY + DH - P - RY
    c.rect(RX, RY, RW, RH, t["card"], rx=10)
    c.defs.append(f'<clipPath id="pane"><rect x="{RX}" y="{RY}" width="{RW}" height="{RH}" rx="10"/></clipPath>')
    IX, IW = RX + P, RW - 2 * P  # content column
    c.text(IX, RY + P + 8, "Models", 11, t["fg"], weight=600)
    hy = RY + P + 26
    c.text(IX, hy + 14, "Providers", 10, t["muted"], weight=600)
    abw = 16 + tw("Add providers", 9, 500) + 17
    c.button(IX + IW - abw, hy + 2, "Add providers", icon="plus", size=9, h=20, pad=8)
    TP = 12  # tile padding
    TH = 36

    def tile_row(x, y, w, provider, name, status, right=None, cls=""):
        c.provider_mark(provider, x + TP, y + 10, 16, cls=cls)
        c.text(x + TP + 24, y + 21.5, name, 10, t["fg"], weight=500, cls=cls)
        nx = x + TP + 24 + tw(name, 10, 500) + 8
        if status == "valid":
            c.badge(nx, y + 10, "Connected", "default", icon="check-circle", cls=cls)
        elif status == "unverified":
            c.badge(nx, y + 10, "Unverified", "caution", icon="hour-glass", cls=cls)
        if right:
            c.text(x + w - TP, y + 21.5, right, 8.5, t["muted"], anchor="end", cls=cls)

    def tile(y, h, provider, name, status, right=None, cls=""):
        c.rect(IX, y, IW, h, t["elcard"], rx=8, stroke=t["border"], cls=cls)
        tile_row(IX, y, IW, provider, name, status, right, cls)

    y = hy + 30
    tile(y, TH, "openslop", "OpenSlop", "valid", "Included with your account")
    y += TH + 8
    tile(y, TH, "anthropic", "Anthropic", "valid", "••••k3Qp · added Sep 3")
    y += TH + 8
    cy = y
    # Cartesia: the key form, then the connected tile
    FH = 100
    form = c.span(0, 7.4, fade=0.15)
    c.rect(IX, cy, IW, FH, t["elcard"], rx=8, stroke=t["border"], cls=form)
    c.rect(IX, cy, IW, FH, "none", rx=8, stroke=t["accent"], cls=c.span(0, 0.6, fade=0.4))
    tile_row(IX, cy, IW, "cartesia", "Cartesia", None, cls=form)
    nx = IX + TP + 24 + tw("Cartesia", 10, 500) + 8
    c.badge(nx, cy + 10, "Unverified", "caution", icon="hour-glass", cls=c.span(4.0, 7.4, fade=0.1))
    c.text(IX + TP, cy + 44, "Cartesia API key", 9, t["fg"], cls=form)
    c.rect(IX + TP, cy + 50, IW - 2 * TP, 22, t["elinput"], rx=5, stroke=t["border"], cls=form)
    c.rect(IX + TP, cy + 50, IW - 2 * TP, 22, "none", rx=5, stroke=t["accent"], sw=1.5, cls=c.span(1.0, 3.6, fade=0.1))
    c.text(IX + TP + 8, cy + 64.5, "Paste in your API key here", 9, t["muted"], cls=c.span(0, 1.4, fade=0.05))
    c.typewriter(IX + TP + 8, cy + 64.5, "•" * 34, 1.4, 3.0, 9, t["fg"], cls=form)
    sw_ = 14 + tw("Save and validate", 8.5, 500) + 16.5
    c.button(IX + TP, cy + 78, "Save and validate", icon="key", variant="primary", size=8.5, h=18, pad=7, cls=form)
    c.rect(IX + TP - 2, cy + 76, sw_ + 4, 22, "none", rx=7, stroke=t["accent"], sw=1.5, cls=c.span(3.5, 3.9, fade=0.08))
    c.text(IX + TP + sw_ + 14, cy + 90, "Cancel", 8.5, t["muted"], cls=form)
    c.text(IX + IW - TP - 12, cy + 90, "Get a key", 8.5, t["fg"], anchor="end", weight=600, cls=form, extra='text-decoration="underline"')
    c.icon("external-link", IX + IW - TP - 9, cy + 82, 9, t["fg"], cls=form)
    CH = 66
    con = c.appear(7.5, dy=0)
    c.rect(IX, cy, IW, CH, t["elcard"], rx=8, stroke=t["border"], cls=con)
    tile_row(IX, cy, IW, "cartesia", "Cartesia", "valid", "••••x9Lm · added just now", cls=con)
    bx = IX + TP
    bx += c.button(bx, cy + 40, "Test", icon="refresh-cw", size=8.5, h=18, pad=7, cls=con) + 6
    c.button(bx, cy + 40, "Replace key", icon="pencil", size=8.5, h=18, pad=7, cls=con)
    dw = 14 + tw("Delete key", 8.5, 500) + 16.5
    c.button(IX + IW - TP - dw, cy + 40, "Delete key", icon="trash", variant="destructive", size=8.5, h=18, pad=7, cls=con)
    # the rows below move up once the form collapses
    up = c.shift(7.5, dy=-(FH - CH), dur=0.3)
    c.raw(f'<g clip-path="url(#pane)"><g class="{up}">')
    dy2 = cy + FH + 14
    c.raw(f'<line x1="{IX}" y1="{dy2}" x2="{IX + IW}" y2="{dy2}" stroke="{t["border"]}"/>')
    c.text(IX, dy2 + 26, "Account defaults", 10, t["muted"], weight=600)
    rw = c.button_w("Reset to recommended", icon="rotate-ccw", size=8.5, pad=7)
    c.button(IX + IW - rw, dy2 + 14, "Reset to recommended", icon="rotate-ccw", variant="secondary", size=8.5, h=18, pad=7)
    c.raw("</g></g>")
    c.write()


def window(c, x, y, w, h, title, icon):
    """A desktop window: a raised card with a title bar and traffic lights."""
    t = c.t
    c.stage(x, y, w, h, 10, fill=t["card"])
    c.rect(x, y, w, 26, t["recessed"], rx=10)
    c.rect(x, y + 16, w, 10, t["recessed"])
    c.raw(f'<line x1="{x}" y1="{y + 26}" x2="{x + w}" y2="{y + 26}" stroke="{t["border"]}"/>')
    for i in range(3):
        c.raw(f'<circle cx="{x + 14 + i * 12}" cy="{y + 13}" r="3.5" fill="{t["border2"]}"/>')
    tw_ = 15 + tw(title, 9, 500)
    c.icon(icon, x + w / 2 - tw_ / 2, y + 7.5, 11, t["muted"])
    c.text(x + w / 2 - tw_ / 2 + 15, y + 16.5, title, 9, t["muted"], weight=500)


# =====================================================================================
# 7. Run it on your computer — npm run local
# =====================================================================================
def card_local(theme):
    c = Card("local", "Run it on your computer", "A terminal runs npm run local: Supabase, the migrations and the video renderer start on this machine, then Next.js starts and OpenSlop opens at localhost:3000 with the user's projects, saved on their own computer.", 12, theme)
    t = c.t
    c.bg()

    # ---- the terminal
    TX, TY, TW, TH = 34, 34, 318, 172
    window(c, TX, TY, TW, TH, "Terminal", "terminal")
    LX, LY, LH, FS = TX + 14, TY + 50, 18, 9.5
    prompt = "~/openslop $ "
    c.text(LX, LY, prompt, FS, t["muted"], family=MONO)
    col = lambda s: LX + tw(s, FS, family=MONO) * 1.06
    c.typewriter(col(prompt), LY, "npm run local", 0.4, 1.4, FS, t["fg"], family=MONO)
    steps = [
        (2.0, "> openslop@0.1.0 local"),
        (2.4, "> node scripts/local.mjs"),
        (3.5, "\u25b2 Next.js 16.4.6"),
    ]
    for i, (at, line) in enumerate(steps):
        y = LY + (i + 1) * LH + 4
        c.text(LX, y, line, FS, t["fg"] if i == 2 else t["muted"], family=MONO, weight=600 if i == 2 else 400, cls=c.appear(at, dy=3))
    ry = LY + 4 * LH + 4
    cl = c.appear(4.0, dy=3)
    c.text(LX, ry, "- Local:", FS, t["muted"], family=MONO, cls=cl)
    c.text(col("- Local:  "), ry, "http://localhost:3000", FS, t["accent"], family=MONO, cls=cl)
    c.text(LX, ry + LH, "\u2713 Ready in 1.2s", FS, t["success"], family=MONO, cls=c.appear(4.3, dy=3))
    ry += LH
    c.text(LX, ry + LH, "\u258f", FS, t["fg"], family=MONO, cls=f"{c.appear(4.4, dy=0)} {c.blink(1.0)}")

    # ---- the browser, opened by the launcher and already signed in
    BX, BY, BW, BH = 236, 112, 372, 212
    win = c.appear(5.0, dy=14, fade=0.4)
    c.raw(f'<g class="{win}">')
    window(c, BX, BY, BW, BH, "OpenSlop", "monitor")
    ax, ay, aw = BX + 70, BY + 34, BW - 140
    c.rect(ax, ay, aw, 20, t["elinput"], rx=10)
    c.icon("home", ax + 8, ay + 4.5, 11, t["muted"])
    c.text(ax + 24, ay + 13.5, "localhost:3000", 9, t["fg"])
    PX = BX + 18
    hy = ay + 46
    c.text(PX, hy, "My Slop", 15, t["fg"], weight=600)
    c.text(PX, hy + 15, "3 projects", 9, t["muted"])
    nb = c.button_w("New slop", icon="plus", size=9)
    c.button(BX + BW - 18 - nb, hy - 14, "New slop", icon="plus", variant="primary", size=9, h=22)
    c.raw(f'<circle cx="{BX + BW - 18}" cy="{BY + 44}" r="8" fill="{t["secondary"]}" stroke="{t["border"]}"/>')
    c.icon("user", BX + BW - 23, BY + 39, 10, t["muted"])
    gap = 12
    gw = (BW - 36 - 2 * gap) / 3
    gy = hy + 28
    for i, (img, name, edited) in enumerate((("tokyo0", "Neon Drift", "Edited just now"), ("city1", "City of Smoke", "Edited 2 days ago"), ("drift2", "Last Lap", "Edited last week"))):
        gx = PX + i * (gw + gap)
        cl = c.appear(5.6 + i * 0.25, dy=6)
        c.image(img, gx, gy, gw, gw * 9 / 16, rx=6, cls=cl, thumb=True)
        c.text(gx, gy + gw * 9 / 16 + 14, name, 9, t["fg"], weight=500, cls=cl)
        c.text(gx, gy + gw * 9 / 16 + 25, edited, 7.5, t["muted"], cls=cl)
    c.raw("</g>")

    # ---- the point: it all lives here
    msg = "Saved on this computer"
    pw = c.pill_w(msg, 10, icon="hard-drive", pad=10)
    px, py = BX + BW / 2 - pw / 2, BY + BH - 10
    cl = c.appear(7.0, dy=6)
    c.shadow(px, py, pw, 24, 12, 0.7, cls=cl)
    c.pill(px, py, msg, 10, t["card"], t["fg"], icon="hard-drive", icon_color=t["success"], h=24, pad=10, cls=cl)
    c.write()


# =====================================================================================
# Local mode, step by step: one card per README step, drawn from the real pages they visit
# =====================================================================================
# GitHub's Primer tokens, read off github.com in each mode
GH = {
    "light": dict(canvas="#ffffff", fg="#1f2328", muted="#59636e", border="#d1d9e0", btn="#f6f8fa", primary="#1f883d", pressed="#197935",
                  overlay="#ffffff", seg="#e6eaef", segsel="#ffffff", underline="#fd8c73", hover="#818b981f"),
    "dark": dict(canvas="#0d1117", fg="#f0f6fc", muted="#9198a1", border="#3d444d", btn="#212830", primary="#238636", pressed="#197935",
                 overlay="#010409", seg="#010409", segsel="#212830", underline="#f78166", hover="#656c7633"),
}
GH_SANS = "'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"
# nodejs.org/en/download in each mode
NODE = {
    "light": dict(page="#ffffff", fg="#2c3437", border="#d9e1e4", green="#417e38", pressed="#356a2e"),
    "dark": dict(page="#0d121c", fg="#ffffff", border="#556066", green="#417e38", pressed="#356a2e"),
}
NODE_SANS = "'Open Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
# docker.com has one theme; Docker Desktop follows the system
DOCKER = dict(page="#f9fafb", fg="#17191e", blue="#2560ff", pressed="#1d4fd8", menu="#002978", hover="#ffffff1f", border="#d0d5dd")
WINDOWS_MARK = "M0 1.4 6.5.5v6.2H0zM7.3.4 16-.8v7.5H7.3zM0 7.5h6.5v6.2L0 12.8zM7.3 7.5H16v7.7l-8.7-1.2z"
# Octicons, copied from github.com's markup
OCTICONS = {
    "code": "m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z",
    "triangle-down": "m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z",
    "terminal": "M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM7.25 8a.749.749 0 0 1-.22.53l-2.25 2.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L5.44 8 3.72 6.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.25 2.25c.141.14.22.331.22.53Zm1.5 1.5h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5Z",
    "question": "M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.92 6.085h.001a.749.749 0 1 1-1.342-.67c.169-.339.436-.701.849-.977C6.845 4.16 7.369 4 8 4a2.756 2.756 0 0 1 1.637.525c.503.377.863.965.863 1.725 0 .448-.115.83-.329 1.15-.205.307-.47.513-.692.662-.109.072-.22.138-.313.195l-.006.004a6.24 6.24 0 0 0-.26.16.952.952 0 0 0-.276.245.75.75 0 0 1-1.248-.832c.184-.264.42-.489.692-.661.103-.067.207-.132.313-.195l.007-.004c.1-.061.182-.11.258-.161a.969.969 0 0 0 .277-.245C8.96 6.514 9 6.427 9 6.25a.612.612 0 0 0-.262-.525A1.27 1.27 0 0 0 8 5.5c-.369 0-.595.09-.74.187a1.01 1.01 0 0 0-.34.398ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
    "copy": "M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z",
    "file-zip": "M3.5 1.75v11.5c0 .09.048.173.126.217a.75.75 0 0 1-.752 1.298A1.748 1.748 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.185 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-.5a.75.75 0 0 1 0-1.5h.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177L9.513 1.573a.25.25 0 0 0-.177-.073H7.25a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h-3a.25.25 0 0 0-.25.25Zm3.75 8.75h.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3c0-.966.784-1.75 1.75-1.75ZM6 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 6 5.25Zm.75 2.25h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 6.75A.75.75 0 0 1 8.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 6.75ZM8.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 9.75A.75.75 0 0 1 8.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 9.75Zm-1 2.5v2.25h1v-2.25a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25Z",
    "mark-github": "M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z",
}


def octicon(c, name, x, y, size, color, cls=""):
    c.raw(c.wrap(f'<path transform="translate({x},{y}) scale({size / 16:.4f})" d="{OCTICONS[name]}" fill="{color}"/>', cls))


def browser(c, x, y, w, h, url, page):
    """A browser window around `page`. Returns the page's top edge and a clip id for its contents."""
    t = c.t
    c.shadow(x, y, w, h, 10)
    c.rect(x, y, w, h, page, rx=10, stroke=t["border"])
    c.rect(x, y, w, 30, t["recessed"], rx=10)
    c.rect(x, y + 20, w, 10, t["recessed"])
    c.raw(f'<line x1="{x}" y1="{y + 30}" x2="{x + w}" y2="{y + 30}" stroke="{t["border"]}"/>')
    for i in range(3):
        c.raw(f'<circle cx="{x + 14 + i * 12}" cy="{y + 15}" r="3.5" fill="{t["border2"]}"/>')
    c.rect(x + 60, y + 6, w - 120, 18, t["elinput"], rx=9)
    uw = 14 + tw(url, 9)
    c.icon("lock", x + w / 2 - uw / 2, y + 10, 10, t["muted"])
    c.text(x + w / 2 - uw / 2 + 14, y + 18.5, url, 9, t["fg"])
    c.icon("download", x + w - 28, y + 9, 12, t["muted"])
    clip = c.cls("pg")
    c.defs.append(f'<clipPath id="{clip}"><rect x="{x}" y="{y + 30}" width="{w}" height="{h - 30}" rx="10"/></clipPath>')
    return y + 30, clip


def download_bubble(c, right, top, name, t0, done):
    """The browser's download panel: the file arrives, then reads Done."""
    t = c.t
    w, h = 214, 52
    x = right - w
    cl = c.appear(t0, dy=-4, fade=0.2)
    c.shadow(x, top, w, h, 10, 0.9, cls=cl)
    c.rect(x, top, w, h, t["card"], rx=10, stroke=t["border"], cls=cl)
    c.rect(x + 10, top + 10, 32, 32, t["secondary"], rx=7, cls=cl)
    c.icon("file", x + 18, top + 18, 16, t["fg"], cls=cl)
    c.text(x + 52, top + 22, name, 9.5, t["fg"], weight=500, cls=cl)
    c.rect(x + 52, top + 31, w - 66, 3, t["scrubtrack"], rx=1.5, cls=c.span(t0, done + 0.1))
    c.rect(x + 52, top + 31, w - 66, 3, t["accent"], rx=1.5, cls=f"{c.span(t0, done + 0.1)} {c.grow(t0 + 0.2, done)}")
    done_cls = c.appear(done + 0.15, dy=0)
    c.icon("check-circle", x + 52, top + 33, 10, t["success"], cls=done_cls)
    c.text(x + 66, top + 41.5, "Done", 8.5, t["muted"], cls=done_cls)
    return x, w, h


def os_menu(c, x, y, items, hover, cls):
    """A right-click menu: (icon, label) rows, with `hover` = (row, t0, t1) highlighted."""
    t = c.t
    w, rh = 168, 24
    h = rh * len(items) + 8
    c.shadow(x, y, w, h, 8, 0.9, cls=cls)
    c.rect(x, y, w, h, t["card"], rx=8, stroke=t["border"], cls=cls)
    row, h0, h1 = hover
    c.rect(x + 4, y + 4 + row * rh, w - 8, rh, t["hover"], rx=5, cls=f"{cls} {c.span(h0, h1, fade=0.08)}")
    for i, (icon, label) in enumerate(items):
        ry = y + 4 + i * rh
        c.icon(icon, x + 12, ry + 6, 12, t["muted"], cls=cls)
        c.text(x + 32, ry + 15.5, label, 9.5, t["fg"], cls=cls)
    return [(x + 70, y + 4 + i * rh + rh / 2) for i in range(len(items))]


def done_pill(c, cx, y, msg, at):
    t = c.t
    pw = c.pill_w(msg, 10, icon="check-circle", pad=10)
    cl = c.appear(at, dy=6)
    c.shadow(cx - pw / 2, y, pw, 24, 12, 0.7, cls=cl)
    c.pill(cx - pw / 2, y, msg, 10, t["card"], t["fg"], icon="check-circle", icon_color=t["success"], h=24, pad=10, cls=cl)


def card_step_node(theme):
    c = Card("local-step-node", "Install Node.js", "On nodejs.org's download page, the Windows Installer button is clicked, the installer downloads and runs, and Node.js is installed.", 11, theme)
    t, n = c.t, NODE[theme]
    c.bg()
    BX, BY, BW, BH = 24, 16, 592, 328
    top, clip = browser(c, BX, BY, BW, BH, "nodejs.org/en/download", n["page"])
    Z = 1.15
    PX, PY = BX + 26, top + 20
    c.raw(f'<g clip-path="url(#{clip})"><g transform="translate({PX},{PY}) scale({Z})">')
    c.text(0, 30, "Download Node.js®", 30, n["fg"], weight=600, family=NODE_SANS, extra='letter-spacing="-0.4"')
    ly = 66
    c.text(0, ly + 24, "Or get a prebuilt Node.js® for", 16, n["fg"], family=NODE_SANS)
    sx = tw("Or get a prebuilt Node.js® for", 16) + 10
    c.rect(sx, ly, 140, 38, n["page"], rx=4, stroke=n["border"])
    c.raw(f'<path transform="translate({sx + 14},{ly + 12}) scale(0.9)" d="{WINDOWS_MARK}" fill="#0078d4"/>')
    c.text(sx + 36, ly + 24, "Windows", 14, n["fg"], weight=500, family=NODE_SANS)
    c.icon("chevron-down", sx + 116, ly + 12, 14, n["fg"])
    rx_ = sx + 150
    c.text(rx_, ly + 24, "running a", 16, n["fg"], family=NODE_SANS)
    ax = rx_ + tw("running a", 16) + 10
    c.rect(ax, ly, 112, 38, n["page"], rx=4, stroke=n["border"])
    c.text(ax + 14, ly + 24, "x64", 14, n["fg"], weight=500, family=NODE_SANS)
    c.icon("chevron-down", ax + 88, ly + 12, 14, n["fg"])
    c.text(ax + 124, ly + 24, "architecture.", 16, n["fg"], family=NODE_SANS)
    by = ly + 62
    label = "Windows Installer (.msi)"
    bw = 16 + 18 + 10 + tw(label, 14, 600) + 16
    c.rect(0, by, bw, 38, n["green"], rx=4)
    c.rect(0, by, bw, 38, n["pressed"], rx=4, cls=c.span(1.35, 1.6, fade=0.08))
    c.icon("cloud-download", 16, by + 10, 18, "#ffffff")
    c.text(44, by + 24, label, 14, "#ffffff", weight=600, family=NODE_SANS)
    c.raw("</g></g>")
    btn = (PX + bw / 2 * Z, PY + (by + 19) * Z)

    bx, bw_, bh = download_bubble(c, BX + BW - 12, BY + 34, "node-v26.13.1-x64.msi", 1.6, 2.9)
    bub = (bx + bw_ / 2, BY + 34 + bh / 2)

    # the installer, opened from the download
    WX, WY, WW, WH = 150, 120, 340, 196
    win = c.span(3.75, 8.6, fade=0.25)
    c.raw(f'<g class="{win}">')
    window(c, WX, WY, WW, WH, "Node.js Setup", "package")
    IX = WX + 22
    c.rect(WX + 1, WY + 27, 6, WH - 28, n["green"])
    for (a, b), head, sub in (
        ((3.75, 4.6), "Welcome to the Node.js Setup Wizard", "This installs Node.js on your computer."),
        ((4.75, 6.9), "Installing Node.js", "Please wait while it is installed."),
        ((7.0, 8.6), "Completed the Node.js Setup Wizard", "Click Finish to exit."),
    ):
        cl = c.span(a, b, fade=0.12)
        c.text(IX, WY + 58, head, 12, t["fg"], weight=600, cls=cl)
        c.text(IX, WY + 76, sub, 9.5, t["muted"], cls=cl)
    prog = c.span(4.75, 6.9, fade=0.12)
    c.rect(IX, WY + 100, WW - 44, 6, t["scrubtrack"], rx=3, cls=prog)
    c.rect(IX, WY + 100, WW - 44, 6, n["green"], rx=3, cls=f"{prog} {c.grow(4.9, 6.8)}")
    bxr = WX + WW - 16
    nb = c.button_w("Next", size=9.5)
    c.button(bxr - nb, WY + WH - 34, "Next", size=9.5, variant="primary", cls=c.span(3.75, 4.6, fade=0.12))
    fb = c.button_w("Finish", size=9.5)
    c.button(bxr - fb, WY + WH - 34, "Finish", size=9.5, variant="primary", cls=c.span(7.0, 8.6, fade=0.12))
    c.raw("</g>")
    nxt = (bxr - nb / 2, WY + WH - 22)
    fin = (bxr - fb / 2, WY + WH - 22)
    done_pill(c, W / 2, H - 52, "Node.js is installed", 8.8)

    c.click(1.4, *btn)
    c.click(3.55, *bub)
    c.click(4.5, *nxt)
    c.click(8.35, *fin)
    c.cursor([(0, 560, 330), (0.3, 560, 330), (1.2, *btn), (1.5, *btn), (3.3, *bub), (3.7, *bub), (4.3, *nxt), (4.6, *nxt), (8.1, *fin), (8.5, *fin), (10.4, 560, 330)])
    c.write()


def card_step_docker(theme):
    c = Card("local-step-docker", "Install Docker Desktop", "On docker.com, Download Docker Desktop opens a menu, the Windows download is picked, and Docker Desktop opens with its engine running.", 12, theme)
    t, d = c.t, DOCKER
    c.bg()
    BX, BY, BW, BH = 24, 16, 592, 328
    top, clip = browser(c, BX, BY, BW, BH, "docker.com/products/docker-desktop", d["page"])
    Z = 0.95
    PX, PY = BX + 30, top + 20
    c.raw(f'<g clip-path="url(#{clip})"><g transform="translate({PX},{PY}) scale({Z})">')
    c.text(0, 16, "Desktop", 14, d["blue"])
    c.text(0, 52, "The #1 containerization software", 32, d["fg"], weight=600, extra='letter-spacing="-0.6"')
    by = 72
    label = "Download Docker Desktop"
    bw = 32 + tw(label, 15, 500)
    c.rect(0, by, bw, 42, d["blue"], rx=8)
    c.rect(0, by, bw, 42, d["pressed"], rx=8, cls=c.span(1.35, 1.6, fade=0.08))
    c.text(16, by + 26, label, 15, "#ffffff", weight=500)
    cw = 32 + tw("Choose plan", 15, 500)
    c.rect(bw + 10, by, cw, 42, "#ffffff", rx=8, stroke=d["border"])
    c.text(bw + 26, by + 26, "Choose plan", 15, d["fg"], weight=500)
    # the menu under the button
    items = ["Download for Mac – Apple Silicon", "Download for Mac – Intel Chip", "Download for Windows – AMD64", "Download for Windows – ARM64", "Download for Linux"]
    my, ih = by + 48, 30
    mw = 24 + max(tw(s, 13, 500) for s in items)
    menu = c.span(1.5, 4.0, fade=0.12)
    c.rect(0, my, mw, ih * len(items) + 12, d["menu"], rx=6, cls=menu)
    c.rect(4, my + 6 + 2 * ih, mw - 8, ih, d["hover"], rx=4, cls=f"{menu} {c.span(3.0, 4.0, fade=0.08)}")
    for i, s in enumerate(items):
        c.text(12, my + 6 + i * ih + 20, s, 13, "#ffffff", weight=500, cls=menu)
    c.raw("</g></g>")
    btn = (PX + bw / 2 * Z, PY + (by + 21) * Z)
    pick = (PX + 90 * Z, PY + (my + 6 + 2.5 * ih) * Z)

    bx, bw_, bh = download_bubble(c, BX + BW - 12, BY + 34, "Docker Desktop Installer.exe", 4.0, 5.2)
    bub = (bx + bw_ / 2, BY + 34 + bh / 2)

    # Docker Desktop, installed and running
    AX, AY, AW, AH = 132, 110, 376, 186
    app = c.appear(6.2, dy=12, fade=0.35)
    c.raw(f'<g class="{app}">')
    c.shadow(AX, AY, AW, AH, 8, 1.1)
    c.rect(AX, AY, AW, AH, t["card"], rx=8, stroke=t["border"])
    c.rect(AX, AY, AW, 28, "#1d63ed", rx=8)
    c.rect(AX, AY + 20, AW, 8, "#1d63ed")
    c.text(AX + 12, AY + 18.5, "docker", 11, "#ffffff", weight=700)
    c.text(AX + 12 + tw("docker", 11, 700) + 2, AY + 18.5, "desktop", 11, "#ffffff", weight=400)
    c.rect(AX + 1, AY + 28, 96, AH - 52, t["recessed"])
    for i, (icon, label) in enumerate((("box", "Containers"), ("layers", "Images"), ("hard-drive", "Volumes"), ("tool", "Builds"))):
        yy = AY + 38 + i * 24
        if i == 0:
            c.rect(AX + 6, yy - 2, 86, 20, t["secondary"], rx=4)
        c.icon(icon, AX + 12, yy + 2, 11, t["accent"] if i == 0 else t["muted"])
        c.text(AX + 28, yy + 11.5, label, 9, t["fg"] if i == 0 else t["muted"], weight=500 if i == 0 else 400)
    c.text(AX + 112, AY + 50, "Containers", 13, t["fg"], weight=600)
    c.text(AX + 112, AY + 66, "Your running containers show up here.", 9, t["muted"])
    c.raw(f'<line x1="{AX}" y1="{AY + AH - 24}" x2="{AX + AW}" y2="{AY + AH - 24}" stroke="{t["border"]}"/>')
    c.rect(AX + 1, AY + AH - 23.5, AW - 2, 22.5, t["recessed"], rx=7)
    eng = c.appear(7.4, dy=0)
    c.raw(f'<circle cx="{AX + 16}" cy="{AY + AH - 12}" r="3.5" fill="{t["caution"]}" class="{c.span(6.2, 7.4, fade=0.05)}"/>')
    c.text(AX + 26, AY + AH - 8.5, "Engine starting", 9, t["muted"], cls=c.span(6.2, 7.4, fade=0.05))
    c.raw(f'<circle cx="{AX + 16}" cy="{AY + AH - 12}" r="3.5" fill="{t["success"]}" class="{eng}"/>')
    c.text(AX + 26, AY + AH - 8.5, "Engine running", 9, t["fg"], weight=500, cls=eng)
    c.raw("</g>")
    done_pill(c, W / 2, H - 50, "Leave Docker Desktop open", 8.0)

    c.click(1.4, *btn)
    c.click(3.75, *pick)
    c.click(5.75, *bub)
    c.cursor([(0, 560, 330), (0.3, 560, 330), (1.2, *btn), (1.6, *btn), (2.9, *pick), (3.9, *pick), (5.5, *bub), (5.9, *bub), (7.0, 560, 330)])
    c.write()


def card_step_download(theme):
    c = Card("local-step-download", "Download OpenSlop", "On OpenSlop's GitHub page, the green Code button opens a menu, Download ZIP is clicked, and openslop-master.zip downloads.", 11.5, theme)
    t, g = c.t, GH[theme]
    c.bg()
    BX, BY, BW, BH = 24, 16, 592, 328
    top, clip = browser(c, BX, BY, BW, BH, "github.com/openslop/openslop", g["canvas"])
    Z = 1.1
    PX, PY = BX + (BW - 492 * Z) / 2, top + 18
    PAN = -112
    pan = c.keys([(2.2, "transform:translate(0,0)"), (2.8, f"transform:translate(0,{PAN}px)"), (9.8, f"transform:translate(0,{PAN}px)"), (10.4, "transform:translate(0,0)")])
    c.raw(f'<g clip-path="url(#{clip})"><g class="{pan}"><g transform="translate({PX:.1f},{PY}) scale({Z})">')
    # the row above the file list
    c.rect(0, 0, 273, 32, g["canvas"], rx=6, stroke=g["border"])
    c.icon("search", 10, 8, 16, g["muted"])
    c.text(34, 21, "Go to file", 14, g["muted"], family=GH_SANS)
    c.rect(247, 7, 18, 18, "none", rx=4, stroke=g["border"])
    c.text(256, 20, "T", 11, g["muted"], anchor="middle", family=GH_SANS)
    c.rect(282, 0, 94, 32, g["btn"], rx=6, stroke=g["border"])
    c.text(294, 21, "Add file", 14, g["fg"], weight=500, family=GH_SANS)
    octicon(c, "triangle-down", 352, 8, 16, g["muted"])
    c.rect(385, 0, 107, 32, g["primary"], rx=6)
    c.rect(385, 0, 107, 32, g["pressed"], rx=6, cls=c.span(1.35, 1.6, fade=0.08))
    octicon(c, "code", 397, 8, 16, "#ffffff")
    c.text(421, 21, "Code", 14, "#ffffff", weight=500, family=GH_SANS)
    octicon(c, "triangle-down", 466, 8, 16, "#ffffff")
    # the file list behind the menu
    c.rect(0, 44, 492, 300, g["canvas"], rx=6, stroke=g["border"])
    for i, name in enumerate(("app", "components", "lib", "public", "remotion", "scripts", "supabase/migrations")):
        ry = 44 + i * 42
        if i:
            c.raw(f'<line x1="0" y1="{ry}" x2="492" y2="{ry}" stroke="{g["border"]}"/>')
        c.icon("folder-s", 16, ry + 13, 16, g["muted"])
        c.text(42, ry + 26, name, 14, g["fg"], family=GH_SANS)
    # the Code menu
    OX, OY = 92, 35
    ov = c.span(1.55, 4.2, fade=0.12)
    c.raw(f'<g class="{ov}">')
    c.shadow(OX, OY, 400, 295, 12, 0.8)
    c.rect(OX, OY, 400, 295, g["overlay"], rx=12, stroke=g["border"])
    c.text(OX + 16, OY + 29, "Local", 14, g["fg"], weight=600, family=GH_SANS)
    c.text(OX + 78, OY + 29, "Codespaces", 14, g["fg"], family=GH_SANS)
    c.rect(OX + 8, OY + 46, 52, 2, g["underline"], rx=1)
    c.raw(f'<line x1="{OX}" y1="{OY + 48}" x2="{OX + 400}" y2="{OY + 48}" stroke="{g["border"]}"/>')
    octicon(c, "terminal", OX + 16, OY + 66, 16, g["fg"])
    c.text(OX + 40, OY + 79, "Clone", 14, g["fg"], weight=600, family=GH_SANS)
    octicon(c, "question", OX + 363, OY + 68, 16, g["muted"])
    c.rect(OX + 16, OY + 97, 220, 32, g["seg"], rx=6, stroke=g["border"] if theme == "dark" else None)
    c.rect(OX + 16, OY + 97, 68, 32, g["segsel"], rx=6, stroke=g["border"])
    c.text(OX + 50, OY + 118, "HTTPS", 14, g["fg"], weight=600, anchor="middle", family=GH_SANS)
    c.text(OX + 110, OY + 118, "SSH", 14, g["fg"], anchor="middle", family=GH_SANS)
    c.raw(f'<line x1="{OX + 137}" y1="{OY + 105}" x2="{OX + 137}" y2="{OY + 121}" stroke="{g["border"]}"/>')
    c.text(OX + 152, OY + 118, "GitHub CLI", 14, g["fg"], family=GH_SANS)
    c.rect(OX + 16, OY + 138, 331, 32, g["canvas"], rx=6, stroke=g["border"])
    c.text(OX + 28, OY + 158, "https://github.com/openslop/openslop.git", 12, g["fg"], family=MONO)
    octicon(c, "copy", OX + 360, OY + 146, 16, g["muted"])
    c.text(OX + 16, OY + 193, "Clone using the web URL.", 14, g["muted"], family=GH_SANS)
    c.raw(f'<line x1="{OX}" y1="{OY + 215}" x2="{OX + 400}" y2="{OY + 215}" stroke="{g["border"]}"/>')
    c.rect(OX + 16, OY + 229, 20, 20, g["btn"], rx=5, stroke=g["border"])
    octicon(c, "mark-github", OX + 19, OY + 232, 14, g["fg"])
    c.text(OX + 44, OY + 244, "Open in GitHub Copilot app", 14, g["fg"], family=GH_SANS)
    c.rect(OX + 8, OY + 255, 384, 32, g["hover"], rx=6, cls=c.span(3.2, 4.2, fade=0.08))
    octicon(c, "file-zip", OX + 18, OY + 263, 16, g["muted"])
    c.text(OX + 44, OY + 276, "Download ZIP", 14, g["fg"], family=GH_SANS)
    c.raw("</g></g></g></g>")
    code = (PX + 438 * Z, PY + 16 * Z)
    zipx, zipy = PX + (OX + 110) * Z, PY + (OY + 271) * Z + PAN

    download_bubble(c, BX + BW - 12, BY + 34, "openslop-master.zip", 4.3, 5.8)
    done_pill(c, W / 2, H - 52, "Saved to your Downloads folder", 6.3)

    c.click(1.4, *code)
    c.click(3.75, zipx, zipy)
    c.cursor([(0, 560, 330), (0.3, 560, 330), (1.2, *code), (1.6, *code), (2.2, *code), (2.8, code[0], code[1] + PAN), (3.2, zipx, zipy), (3.9, zipx, zipy), (5.0, 560, 330)])
    c.write()


def card_step_terminal(theme):
    c = Card("local-step-terminal", "Unzip it and run OpenSlop", "In the Downloads folder, the zip is extracted with Extract All, the new folder is opened in Terminal, and npm install then npm run local start OpenSlop at localhost:3000.", 13, theme)
    t = c.t
    c.bg()
    # the Downloads folder
    EX, EY, EW, EH = 24, 20, 400, 200
    window(c, EX, EY, EW, EH, "Downloads", "folder")
    hy = EY + 46
    for x_, label in ((EX + 40, "Name"), (EX + 230, "Type")):
        c.text(x_, hy, label, 8.5, t["muted"], weight=500)
    c.raw(f'<line x1="{EX + 12}" y1="{hy + 7}" x2="{EX + EW - 12}" y2="{hy + 7}" stroke="{t["border"]}"/>')
    r1, r2 = hy + 14, hy + 38

    def row(y, icon, color, name, kind, sel, cls=""):
        c.rect(EX + 10, y, EW - 20, 22, t["secondary"], rx=4, cls=f"{cls} {sel}".strip())
        c.icon(icon, EX + 18, y + 5, 12, color, cls=cls)
        c.text(EX + 40, y + 14.5, name, 9.5, t["fg"], cls=cls)
        c.text(EX + 230, y + 14.5, kind, 9, t["muted"], cls=cls)

    folder_in = c.appear(2.5, dy=0, fade=0.25)
    zip_down = c.shift(2.5, dy=24, dur=0.25)
    c.raw(f'<g class="{zip_down}">')
    row(r1, "archive", t["muted"], "openslop-master.zip", "Compressed (zipped) Folder", c.span(0.6, 2.3, fade=0.1))
    c.raw("</g>")
    row(r1, "folder", t["caution"], "openslop-master", "File folder", c.span(2.9, 4.3, fade=0.1), cls=folder_in)

    m1 = c.span(1.0, 2.1, fade=0.1)
    zrow = os_menu(c, EX + 150, r1 + 14, [("folder-open", "Open"), ("archive", "Extract All…"), ("share", "Share"), ("copy", "Copy as path")], (1, 1.5, 2.1), m1)
    m2 = c.span(3.1, 4.3, fade=0.1)
    frow = os_menu(c, EX + 150, r1 + 14, [("folder-open", "Open"), ("terminal", "Open in Terminal"), ("share", "Share"), ("copy", "Copy as path")], (1, 3.6, 4.3), m2)

    # the terminal, opened in that folder
    TX, TY, TW, TH = 150, 116, 466, 228
    term = c.appear(4.5, dy=12, fade=0.3)
    c.raw(f'<g class="{term}">')
    window(c, TX, TY, TW, TH, "Terminal", "terminal")
    LX, LY, LH, FS = TX + 14, TY + 46, 17, 9
    col = lambda s: LX + tw(s, FS, family=MONO) * 1.06
    prompt = r"PS C:\Users\you\Downloads\openslop-master> "
    c.text(LX, LY, prompt, FS, t["muted"], family=MONO)
    c.typewriter(col(prompt), LY, "npm install", 5.0, 5.8, FS, t["fg"], family=MONO)
    c.text(LX, LY + LH, "added 1415 packages in 2m", FS, t["fg"], family=MONO, cls=c.appear(6.6, dy=3))
    p2 = c.appear(7.0, dy=0)
    c.text(LX, LY + 2 * LH + 6, prompt, FS, t["muted"], family=MONO, cls=p2)
    c.typewriter(col(prompt), LY + 2 * LH + 6, "npm run local", 7.3, 8.2, FS, t["fg"], family=MONO, cls=p2)
    for i, (at, parts) in enumerate((
        (9.0, (("▲ Next.js 16.4.6", t["fg"]),)),
        (9.3, (("- Local:   ", t["muted"]), ("http://localhost:3000", t["accent"]))),
        (9.7, (("✓", t["success"]), (" Ready", t["fg"]))),
    )):
        y = LY + (3 + i) * LH + 12
        cl = c.appear(at, dy=3)
        x_ = LX
        for s, color in parts:
            c.text(x_, y, s, FS, color, family=MONO, cls=cl)
            x_ = col(s) - LX + x_
    c.raw("</g>")
    done_pill(c, TX + TW / 2, H - 40, "OpenSlop opens in your browser", 10.2)

    zip_xy = (EX + 110, r1 + 11)
    fold_xy = (EX + 110, r1 + 11)
    c.click(1.0, *zip_xy)
    c.click(2.15, *zrow[1])
    c.click(3.1, *fold_xy)
    c.click(4.3, *frow[1])
    c.cursor([(0, 400, 300), (0.3, 400, 300), (0.9, *zip_xy), (1.1, *zip_xy), (1.9, *zrow[1]), (2.3, *zrow[1]), (2.9, *fold_xy), (3.2, *fold_xy), (4.0, *frow[1]), (4.5, *frow[1]), (5.0, 620, 350)])
    c.write()


def card_step_keys(theme):
    c = Card("local-step-keys", "Add your AI keys", "The profile icon opens a menu, Settings opens on Models, Add providers lists the providers, and an Anthropic key is pasted and connected.", 12, theme)
    t = c.t
    c.bg()
    # the account menu, top left like the app
    AV = (34, 30)
    c.raw(f'<circle cx="{AV[0]}" cy="{AV[1]}" r="12" fill="{t["secondary"]}" stroke="{t["border"]}"/>')
    c.icon("user", AV[0] - 6, AV[1] - 6, 12, t["muted"])
    c.text(56, 34, "My Slop", 12, t["fg"], weight=600)
    menu = c.span(1.15, 2.0, fade=0.1)
    MX, MY, MW = 22, 48, 176
    rows = [("contrast", "Appearance"), ("settings", "Settings"), ("user", "Impersonate user"), ("log-out", "Log out")]
    MH = 34 + 26 * len(rows)
    c.shadow(MX, MY, MW, MH, 8, 0.9, cls=menu)
    c.rect(MX, MY, MW, MH, t["card"], rx=8, stroke=t["border"], cls=menu)
    c.text(MX + 10, MY + 19, "local", 9.5, t["fg"], weight=600, cls=menu)
    c.raw(c.wrap(f'<line x1="{MX}" y1="{MY + 29}" x2="{MX + MW}" y2="{MY + 29}" stroke="{t["border"]}"/>', menu))
    c.rect(MX + 4, MY + 32 + 26, MW - 8, 24, t["hover"], rx=5, cls=f"{menu} {c.span(1.6, 2.0, fade=0.08)}")
    for i, (icon, label) in enumerate(rows):
        ry = MY + 32 + i * 26
        c.icon(icon, MX + 12, ry + 6, 12, t["fg"], cls=menu)
        c.text(MX + 32, ry + 16, label, 9.5, t["fg"], cls=menu)
    c.icon("chevron-right", MX + MW - 20, MY + 38, 10, t["muted"], cls=menu)
    c.badge(MX + MW - 38, MY + 32 + 2 * 26 + 6, "Dev", "caution", size=8, cls=menu)
    settings = (MX + 60, MY + 32 + 26 + 12)

    # the Settings dialog
    dlg = c.appear(2.2, dy=8, fade=0.3)
    c.raw(f'<g class="{dlg}">')
    c.rect(0, 0, W, H, "#000000", opacity=0.35)
    P = 14
    DX, DY, DW, DH = 70, 14, 500, 332
    c.shadow(DX, DY, DW, DH, 8, 1.2)
    c.rect(DX, DY, DW, DH, t["recessed"], rx=8, stroke=t["border"])
    c.text(DX + P, DY + P + 8, "Settings", 11, t["fg"], weight=600)
    c.icon("x", DX + DW - P - 12, DY + P, 12, t["muted"])
    NX, NW = DX + P, 96
    NY = DY + P + 24
    c.text(NX + 8, NY + 11, "Account", 10, t["fg"], weight=600)
    c.rect(NX, NY + 22, NW, 22, t["card"], rx=5)
    c.icon("link", NX + 8, NY + 27.5, 11, t["fg"])
    c.text(NX + 24, NY + 36.5, "Models", 10, t["fg"], weight=500)
    RX, RY = NX + NW + 10, NY
    RW, RH = DX + DW - P - RX, DY + DH - P - RY
    c.rect(RX, RY, RW, RH, t["card"], rx=10)
    IX, IW = RX + P, RW - 2 * P
    TP = 12

    # models pane, before
    before = c.span(2.2, 3.35, fade=0.12)
    c.text(IX, RY + P + 8, "Models", 11, t["fg"], weight=600, cls=before)
    hy = RY + P + 26
    c.text(IX, hy + 14, "Providers", 10, t["muted"], weight=600, cls=before)
    abw = c.button_w("Add providers", icon="plus", size=9, pad=8)
    c.button(IX + IW - abw, hy + 2, "Add providers", icon="plus", size=9, h=20, pad=8, cls=before)
    add = (IX + IW - abw / 2, hy + 12)
    c.rect(IX, hy + 34, IW, 54, "none", rx=10, stroke=t["border2"], cls=before, extra='stroke-dasharray="4 3"')
    c.text(IX + IW / 2, hy + 65, "Add a provider to generate on your own key.", 9, t["muted"], anchor="middle", cls=before)

    # Add providers
    browse = c.span(3.45, 4.75, fade=0.12)
    c.icon("arrow-left", IX, RY + P + 1, 12, t["fg"], cls=browse)
    c.text(IX + 20, RY + P + 10, "Add providers", 11, t["fg"], weight=600, cls=browse)
    sy = RY + P + 22
    c.rect(IX, sy, IW, 22, t["elinput"], rx=6, cls=browse)
    c.icon("search", IX + 8, sy + 5.5, 11, t["muted"], cls=browse)
    c.text(IX + 24, sy + 14.5, "Search providers and models", 9, t["muted"], cls=browse)
    gy = sy + 30
    gx = IX
    for i, g in enumerate(("All", "Images", "Videos", "Speech", "Captions", "Sound", "Music", "Text")):
        gw = tw(g, 8.5, 500) + 12
        c.rect(gx, gy, gw, 18, t["secondary"] if i == 0 else "none", rx=5, cls=browse)
        c.text(gx + 6, gy + 12.3, g, 8.5, t["fg"] if i == 0 else t["muted"], weight=500, cls=browse)
        gx += gw + 2
    ty = gy + 28
    tiles = (("anthropic", "Anthropic", "Claude models for scripting, editing and Sloppy's reasoning."), ("runware", "Runware", "Image and video generation across many open model families."), ("cartesia", "Cartesia", "Low-latency speech with a large searchable voice library."))
    cw_ = c.button_w("Connect", icon="link", size=8.5, pad=7)
    for i, (prov, name, desc) in enumerate(tiles):
        yy = ty + i * 52
        c.rect(IX, yy, IW, 46, t["elcard"], rx=8, stroke=t["border"], cls=browse)
        c.provider_mark(prov, IX + TP, yy + 13, 20, cls=browse)
        c.text(IX + TP + 30, yy + 19, name, 10, t["fg"], weight=500, cls=browse)
        dc = c.cls("dc")
        c.defs.append(f'<clipPath id="{dc}"><rect x="{IX + TP + 30}" y="{yy}" width="{IW - 2 * TP - 30 - cw_ - 8}" height="46"/></clipPath>')
        c.text(IX + TP + 30, yy + 33, desc, 8, t["muted"], cls=browse, extra=f'clip-path="url(#{dc})"')
        c.button(IX + IW - TP - cw_, yy + 13, "Connect", icon="link", size=8.5, h=20, pad=7, cls=browse)
    connect = (IX + IW - TP - cw_ / 2, ty + 23)

    # models pane, the key form, then connected
    after = c.appear(4.85, dy=0, fade=0.12)
    c.text(IX, RY + P + 8, "Models", 11, t["fg"], weight=600, cls=after)
    c.text(IX, hy + 14, "Providers", 10, t["muted"], weight=600, cls=after)
    c.button(IX + IW - abw, hy + 2, "Add providers", icon="plus", size=9, h=20, pad=8, cls=after)
    fy = hy + 34
    form = c.span(4.85, 8.3, fade=0.15)
    FH = 100
    c.rect(IX, fy, IW, FH, t["elcard"], rx=8, stroke=t["border"], cls=form)
    c.provider_mark("anthropic", IX + TP, fy + 10, 16, cls=form)
    c.text(IX + TP + 24, fy + 21.5, "Anthropic", 10, t["fg"], weight=500, cls=form)
    c.text(IX + TP, fy + 44, "Anthropic API key", 9, t["fg"], cls=form)
    c.rect(IX + TP, fy + 50, IW - 2 * TP, 22, t["elinput"], rx=5, stroke=t["border"], cls=form)
    c.rect(IX + TP, fy + 50, IW - 2 * TP, 22, "none", rx=5, stroke=t["accent"], sw=1.5, cls=c.span(5.2, 7.2, fade=0.1))
    c.text(IX + TP + 8, fy + 64.5, "Paste in your API key here", 9, t["muted"], cls=c.span(4.85, 5.8, fade=0.05))
    c.typewriter(IX + TP + 8, fy + 64.5, "•" * 34, 5.8, 6.6, 9, t["fg"], cls=form)
    sw_ = c.button_w("Save and validate", icon="key", size=8.5, pad=7)
    c.button(IX + TP, fy + 78, "Save and validate", icon="key", variant="primary", size=8.5, h=18, pad=7, cls=form)
    save = (IX + TP + sw_ / 2, fy + 87)
    con = c.appear(8.4, dy=0)
    CH = 66
    c.rect(IX, fy, IW, CH, t["elcard"], rx=8, stroke=t["border"], cls=con)
    c.provider_mark("anthropic", IX + TP, fy + 10, 16, cls=con)
    c.text(IX + TP + 24, fy + 21.5, "Anthropic", 10, t["fg"], weight=500, cls=con)
    c.badge(IX + TP + 24 + tw("Anthropic", 10, 500) + 8, fy + 10, "Connected", "default", icon="check-circle", cls=con)
    c.text(IX + IW - TP, fy + 21.5, "••••k3Qp · added just now", 8.5, t["muted"], anchor="end", cls=con)
    bx = IX + TP
    bx += c.button(bx, fy + 40, "Test", icon="refresh-cw", size=8.5, h=18, pad=7, cls=con) + 6
    c.button(bx, fy + 40, "Replace key", icon="pencil", size=8.5, h=18, pad=7, cls=con)
    c.raw("</g>")
    done_pill(c, W / 2, H - 50, "Repeat for each kind of model you need", 9.0)

    c.click(1.0, *AV)
    c.click(1.95, *settings)
    c.click(3.25, *add)
    c.click(4.6, *connect)
    c.click(7.4, *save)
    c.cursor([(0, 300, 300), (0.3, 300, 300), (0.9, *AV), (1.2, *AV), (1.7, *settings), (2.1, *settings), (3.0, *add), (3.4, *add), (4.3, *connect), (4.8, *connect), (5.3, IX + 120, fy + 61), (7.0, IX + 120, fy + 61), (7.3, *save), (7.6, *save), (8.6, 560, 320)])
    c.write()


def card_agents_mcp(theme):
    c = Card("agents-mcp", "Your agent drives OpenSlop over MCP", "OpenSlop is added to Claude Code as an MCP server and allowed in the browser. A prompt in the terminal makes tool calls that travel over MCP into the open project: a title, then a script of speech, image and video. Generate renders the image and the video.", 16, theme)
    t = c.t
    c.bg()
    TOP, HT = 20, 276

    # the agent, in its own terminal
    TX, TW = 20, 214
    window(c, TX, TOP, TW, HT, "Claude Code", "terminal")
    LX, FS, LH = TX + 14, 8.5, 18
    col = lambda s: LX + tw(s, FS, family=MONO) * 1.06
    y = TOP + 46
    c.text(LX, y, "$", FS, t["muted"], family=MONO)
    c.typewriter(col("$ "), y, "claude mcp add --transport http \\", 0.3, 1.2, FS, t["fg"], family=MONO)
    c.typewriter(col("$ "), y + LH, "openslop app.openslop.ai/api/mcp", 1.2, 2.0, FS, t["fg"], family=MONO)
    added = c.appear(2.2, dy=3)
    c.text(LX, y + 2 * LH, "\u2713", FS, t["success"], family=MONO, cls=added)
    c.text(col("\u2713 "), y + 2 * LH, "Added openslop", FS, t["fg"], family=MONO, cls=added)
    y += 3 * LH + 16
    asked = c.appear(5.3, dy=0)
    c.text(LX, y, ">", FS, t["accent"], family=MONO, weight=600, cls=asked)
    c.typewriter(col("> "), y, "A neon street race in Tokyo,", 5.4, 6.4, FS, t["fg"], family=MONO, cls=asked)
    c.typewriter(col("> "), y + LH, "45 seconds", 6.4, 6.8, FS, t["fg"], family=MONO, cls=asked)
    y += 2 * LH + 14
    calls = (("set_title", 7.4), ("write_script", 8.4))
    for i, (tool, at) in enumerate(calls):
        cl = c.appear(at, dy=3)
        c.raw(c.wrap(f'<circle cx="{LX + 3}" cy="{y + i * LH - 3}" r="2.5" fill="{t["accent"]}"/>', cl))
        c.text(LX + 12, y + i * LH, f"openslop \u00b7 {tool}", FS, t["fg"], family=MONO, cls=cl)
    reply = c.appear(9.8, dy=3)
    c.text(LX, y + 2 * LH + 12, "Script's in, boss. Hit Generate", FS, t["muted"], family=MONO, cls=reply)
    c.text(LX, y + 3 * LH + 12, "when you're ready.", FS, t["muted"], family=MONO, cls=reply)

    # OpenSlop, open in the browser
    BX, BW = 342, 278
    top, clip = browser(c, BX, TOP, BW, HT, "app.openslop.ai", t["elcard"])
    PX, PW = BX + 14, BW - 28
    c.raw(f'<g clip-path="url(#{clip})">')

    consent = c.span(2.4, 5.0, fade=0.2)
    c.raw(f'<g class="{consent}">')
    CY = top + 40
    c.icon("mcp", BX + BW / 2 - 14, CY, 28, t["fg"])
    c.text(BX + BW / 2, CY + 52, "Connect Claude Code", 14, t["fg"], weight=500, anchor="middle")
    c.text(BX + BW / 2, CY + 70, "It will work in OpenSlop as you.", 9, t["muted"], anchor="middle")
    bx_, bw_ = BX + 40, BW - 80
    c.rect(bx_, CY + 90, bw_, 26, t["accent"], rx=6)
    c.rect(bx_, CY + 90, bw_, 26, "#000000", rx=6, opacity=0.15, cls=c.span(4.3, 4.6, fade=0.05))
    c.text(BX + BW / 2, CY + 107, "Allow", 10, t["accentfg"], weight=500, anchor="middle")
    c.rect(bx_, CY + 124, bw_, 26, t["secondary"], rx=6, stroke=t["border"])
    c.text(BX + BW / 2, CY + 141, "Deny", 10, t["fg"], weight=500, anchor="middle")
    c.raw("</g>")
    allow = (BX + BW / 2, CY + 103)

    editor = c.appear(5.1, dy=6, fade=0.3)
    c.raw(f'<g class="{editor}">')
    c.text(PX, top + 26, "Untitled", 13, t["muted"], weight=600, cls=c.span(0, 7.6, fade=0.1))
    c.text(PX, top + 26, "Neon Drift", 13, t["fg"], weight=600, cls=c.span(7.6, 16))
    gw = c.button_w("Generate", icon="magic", size=8.5, pad=7)
    gx = BX + BW - 14 - gw
    c.button(gx, top + 12, "Generate", icon="magic", size=8.5, h=20, pad=7, cls=c.span(8.6, 16))
    c.rect(gx, top + 12, gw, 20, "#000000", rx=6, opacity=0.2, cls=c.span(11.1, 11.4, fade=0.05))
    generate = (gx + gw / 2, top + 22)
    c.text(PX, top + 48, "Scene 1", 8, t["muted"])
    RH, TH_ = 52, 48 * 9 / 16
    rows = (
        ("speech", "Narrator", "Two rivals. One night. No brakes.", None),
        ("image", "Image", "Two cars at a neon crossing, rain", "tokyo0"),
        ("video", "Video", "A drift around the corner, sparks", "drift2"),
    )
    for i, (kind, label, prompt, render) in enumerate(rows):
        cl = c.appear(8.6 + i * 0.3, dy=6)
        ry = top + 58 + i * (RH + 6)
        c.rect(PX, ry, PW, RH, t["card"], rx=8, stroke=t["border"], cls=cl)
        c.type_pill(PX + 8, ry + 7, kind, label, cls=cl)
        c.rect(PX + 8, ry + 28, PW - 16 - (92 if render else 0), 17, t["elinput"], rx=5, cls=cl)
        c.text(PX + 14, ry + 39.5, prompt if not render else prompt[:24] + "\u2026", 8, t["fg"], cls=cl)
        if render:
            mx, mw, mh = PX + PW - 88, 80, 45
            c.media_placeholder(mx, ry + (RH - mh) / 2, mw, mh, cls=f"{cl} {c.span(8.6, 13.0, fade=0.2)}", animate=True, seed=i + 3)
            c.image(render, mx, ry + (RH - mh) / 2, mw, mh, rx=6, cls=f"{cl} {c.appear(12.9, dy=0, fade=0.4)}", thumb=True)
            if kind == "video":
                pl = c.appear(13.3, dy=0)
                c.raw(c.wrap(f'<circle cx="{mx + mw / 2}" cy="{ry + RH / 2}" r="9" fill="#000000" opacity=".45"/>', pl))
                c.icon("play", mx + mw / 2 - 5, ry + RH / 2 - 5, 10, "#ffffff", cls=pl)
    c.raw("</g></g>")

    # MCP between them: openslop.ai's 1px border streak keeps running out of the agent, over the MCP pill and into the tab
    MX0, MX1, MY = TX + TW, BX, TOP + HT / 2
    pw = c.pill_w("MCP", 8.5, icon="mcp", pad=7)
    px, pr = (MX0 + MX1) / 2 - pw / 2, 10
    c.raw(f'<line x1="{MX0}" y1="{MY}" x2="{MX1}" y2="{MY}" stroke="{t["border2"]}" stroke-dasharray="3 3"/>')
    c.shadow(px, MY - pr, pw, 2 * pr, pr, 0.6)
    c.pill(px, MY - pr, "MCP", 8.5, t["card"], t["fg"], icon="mcp", h=2 * pr, pad=7)
    route = f"M{MX0} {MY}H{px}A{pr} {pr} 0 0 1 {px + pr} {MY - pr}H{px + pw - pr}A{pr} {pr} 0 0 1 {px + pw} {MY}H{MX1}"
    # The route only runs left to right, so a horizontal gradient sliding along it tapers like the site's conic one.
    core = "#ffffff" if theme == "dark" else t["accent"]
    SW, LAP = 64, 2.4
    stops = ((0, "#a78bfa", 0), (0.27, "#a78bfa", 0.7), (0.4, "#c8b4ff", 0.9), (0.5, core, 1), (0.6, "#c8b4ff", 0.9), (0.73, "#a78bfa", 0.7), (1, "#a78bfa", 0))
    stop_tags = "".join(f'<stop offset="{o}" stop-color="{col}" stop-opacity="{op}"/>' for o, col, op in stops)
    c.defs.append(
        f'<linearGradient id="mcp-streak" gradientUnits="userSpaceOnUse" x2="{SW}">{stop_tags}'
        f'<animateTransform attributeName="gradientTransform" type="translate" from="{MX0 - SW} 0" to="{MX1} 0" dur="{LAP}s" repeatCount="indefinite"/></linearGradient>'
    )
    c.defs.append('<filter id="mcp-streak-blur" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>')
    c.raw(f'<path d="{route}" fill="none" stroke="url(#mcp-streak)" stroke-width="3" opacity=".7" filter="url(#mcp-streak-blur)"/>')
    c.raw(f'<path d="{route}" fill="none" stroke="url(#mcp-streak)"/>')

    done_pill(c, W / 2, H - 42, "Your agent drives OpenSlop over MCP", 13.6)
    c.click(4.4, *allow)
    c.click(11.2, *generate)
    c.cursor([(0, 600, 340), (3.0, 600, 340), (4.1, *allow), (4.6, *allow), (5.4, 600, 340), (10.4, 600, 340), (11.0, *generate), (11.5, *generate), (12.4, 600, 340)])
    c.write()


def main():
    for fn in (card_describe, card_sloppy, card_canvas, card_generate, card_timeline, card_providers, card_local):
        fn("dark")
    for theme in ("dark", "light"):
        for fn in (card_step_node, card_step_docker, card_step_download, card_step_terminal, card_step_keys, card_agents_mcp):
            fn(theme)


if __name__ == "__main__":
    main()
