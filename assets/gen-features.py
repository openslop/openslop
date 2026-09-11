#!/usr/bin/env python3
"""Emits assets/features/<card>-{light,dark}.svg: one looping animated card per README feature.

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
        m_character="#d97706", m_image="#0891b2", m_clip="#4f46e5", m_animated="#c026d3", m_music="#7c3aed",
        m_sound="#059669", m_narration="#6a595f", dot="#26171d", dotop="0.10", shadow="#26171d", shadowop="0.10",
        blob="#f5d3a3", blobop="0.9",
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
        m_character="#fbbf24", m_image="#22d3ee", m_clip="#818cf8", m_animated="#e879f9", m_music="#a78bfa",
        m_sound="#34d399", m_narration="#9d8b93", dot="#f1eaed", dotop="0.08", shadow="#000000", shadowop="0.35",
        blob="#4a3a2a", blobop="0.9",
    ),
}

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


def tw(s, size, weight=400):
    """Text width in Inter, measured from public/fonts/InterVariable.woff2."""
    t = INTER[weight]
    return sum(t.get(ch, 0.6) for ch in s) * size * 1.04  # a little slack for wider system fonts


class Card:
    def __init__(self, name, title, desc, loop, theme):
        self.name, self.title, self.desc, self.loop = name, title, desc, loop
        self.t = THEMES[theme]
        self.theme = theme
        self.css, self.body, self.defs, self.n = [], [], [], 0

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

    def spin(self, period=1.0):
        c = self.cls("r")
        self.css.append(
            f".{c}{{animation:kf-{c} {period}s linear infinite;transform-box:fill-box;transform-origin:center}}@keyframes kf-{c}{{to{{transform:rotate(360deg)}}}}"
        )
        return c

    def blink(self, period=1.0):
        c = self.cls("b")
        self.css.append(f".{c}{{animation:kf-{c} {period}s steps(1) infinite}}@keyframes kf-{c}{{0%{{opacity:1}}50%{{opacity:0}}}}")
        return c

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

    def typewriter(self, x, y, s, t0, t1, size=11, fill=None, cls="", weight=400, erase=None, caret=False, start=0):
        """Types `s` between t0 and t1 with a stepped clip. `erase=(e0,e1)` wipes it again.
        `start` is how many leading characters are already there (an edit appended to a line)."""
        cid = self.cls("tw")
        w = tw(s, size, weight) * 1.06 + 4 + (8 if caret else 0)
        n = max(1, len(s) - start)
        f0 = f"{tw(s[:start], size, weight) / w:.4f}" if start else "0"
        e = f"{self.pct(erase[0])}{{transform:scaleX(1);animation-timing-function:steps({n},end)}}{self.pct(erase[1])},100%{{transform:scaleX({f0})}}" if erase else "100%{transform:scaleX(1)}"
        self.css.append(
            f".{cid}{{animation:kf-{cid} {self.loop}s infinite both;transform-box:fill-box;transform-origin:left center}}@keyframes kf-{cid}{{0%,{self.pct(t0)}{{transform:scaleX({f0});animation-timing-function:steps({n},end)}}{self.pct(t1)}{{transform:scaleX(1)}}{e}}}"
        )
        self.defs.append(f'<clipPath id="{cid}"><rect class="{cid}" x="{x - 1}" y="{y - size}" width="{w}" height="{size * 1.5}"/></clipPath>')
        fill = fill or self.t["fg"]
        tail = f'<tspan class="{self.blink(1.0)}" fill="{self.t["accent"]}">|</tspan>' if caret else ""
        self.body.append(
            self.wrap(f'<text x="{x}" y="{y}" font-family="{SANS}" font-size="{size}" font-weight="{weight}" fill="{fill}" style="white-space:pre" clip-path="url(#{cid})">{html.escape(s)}{tail}</text>', cls)
        )

    def pill(self, x, y, label, size=10, fill=None, color=None, icon=None, icon_color=None, chevron=False, h=None, pad=7, cls="", weight=500, icon_size=None):
        t = self.t
        fill = fill or t["secondary"]
        color = color or t["fg"]
        h = h or size + 9
        isz = icon_size or size + 2
        w = pad * 2 + tw(label, size, weight) + (isz + 4 if icon else 0) + (10 if chevron else 0)
        self.rect(x, y, w, h, fill, rx=h / 2 if not chevron else 5, cls=cls)
        cx = x + pad
        if icon:
            self.icon(icon, cx, y + (h - isz) / 2, isz, icon_color or color, cls=cls)
            cx += isz + 4
        self.text(cx, y + h / 2 + size * 0.36, label, size, color, cls=cls, weight=weight)
        if chevron:
            self.icon("chevron-down", x + w - pad - 8, y + (h - 8) / 2, 8, t["muted"], cls=cls)
        return w

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
        w = pad * 2 + tw(label, size, 500) + (isz + 5 if icon else 0)
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
        icon = {"narration": "voice", "character": "user", "image": "image", "animated": "motion", "clip": "video", "sound": "wave-sine", "music": "music"}[kind]
        bg = mix(t["elcard"], tint, 0.15)
        return self.pill(x, y, label, size, bg, tint, icon=icon, h=h, pad=5, cls=cls, weight=500, icon_size=11)

    def model_badge(self, x, y, label, provider="openslop", size=9, cls="", icon_name=None):
        t = self.t
        w = tw(label, size) + 34
        cx = x + 4
        if icon_name:
            self.icon(icon_name, cx, y + 3, 11, t["muted"], cls=cls)
        else:
            self.provider_mark(provider, cx, y + 3, 11, cls=cls)
        self.text(cx + 15, y + 12.3, label, size, t["muted"], cls=cls)
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
        self.raw(self.wrap(f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{vb}" overflow="visible">{inner}</svg>', cls))

    def orb(self, x, y, size=12, cls=""):
        """The OrbLoader: a warm amber-to-rust blob that keeps changing shape."""
        t = self.t
        gid = self.cls("orb")
        self.defs.append(
            f'<linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{t["orb0"]}"/><stop offset="1" stop-color="{t["orb1"]}"/></linearGradient>'
        )
        r1, r2 = self.spin(2.0), self.spin(1.4)
        c = size / 2
        self.raw(
            self.wrap(
                f'<g transform="translate({x},{y})">'
                f'<circle cx="{c}" cy="{c}" r="{c * 0.72:.2f}" fill="url(#{gid})"/>'
                f'<g class="{r1}"><g><circle cx="{c + c * 0.32:.2f}" cy="{c}" r="{c * 0.5:.2f}" fill="url(#{gid})"/></g></g>'
                f'<g class="{r2}"><g><circle cx="{c - c * 0.3:.2f}" cy="{c + c * 0.2:.2f}" r="{c * 0.44:.2f}" fill="url(#{gid})"/></g></g>'
                f"</g>",
                cls,
            )
        )

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

    def balls(self, x, y, w, h, cls="", animate=True):
        """PlaceholderBallsLoader: soft colored circles drifting inside an empty preview."""
        cols = ["#cab3d6", "#f5aa64", "#f58c02", "#94c9e9", "#eeaeca", "#f57802", "#f55702", "#5eaebf"]
        pts = [(0.2, 0.3, 9), (0.5, 0.25, 7), (0.75, 0.4, 10), (0.35, 0.65, 8), (0.62, 0.7, 6), (0.85, 0.72, 7), (0.12, 0.7, 6)]
        cid = self.cls("bc")
        self.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>')
        out = [f'<g clip-path="url(#{cid})">']
        for i, (px, py, r) in enumerate(pts):
            sp = self.spin(2.6 + i * 1.1) if animate else ""
            cx, cy = x + w * px, y + h * py
            out.append(f'<g transform="translate({cx:.1f},{cy:.1f})"><g class="{sp}"><circle cx="{r * 0.9:.1f}" cy="0" r="{r}" fill="{cols[i % len(cols)]}" opacity="0.75"/></g></g>')
        out.append("</g>")
        self.raw(self.wrap("".join(out), cls))

    # ---- chrome shared by the cards
    def bg(self):
        t = self.t
        self.rect(0, 0, W, H, t["bg"])
        self.defs.append(
            f'<pattern id="plus" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 9v6M9 12h6" stroke="{t["dot"]}" stroke-opacity="{t["dotop"]}" stroke-width="1"/></pattern>'
        )
        self.rect(0, 0, W, H, "url(#plus)")

    def stage(self, x, y, w, h, rx=12):
        t = self.t
        self.shadow(x, y, w, h, rx)
        self.rect(x, y, w, h, t["elcard"], rx=rx, stroke=t["border"])

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
    c = Card("describe", "Describe your video", "The hero prompt box cycles through example ideas, the user types one line, and Sloppy takes it from there.", 13, theme)
    t = c.t
    c.bg()
    c.text(W / 2, 56, "Describe your video", 40, t["fg"], anchor="middle", family=SERIF, extra='letter-spacing="-1.4"')

    bx, by, bw, bh = 90, 78, 460, 152
    c.shadow(bx, by, bw, bh, 12, 0.6)
    c.rect(bx, by, bw, bh, t["card"], rx=12, stroke=t["accent"], extra='stroke-opacity="0.35"')
    # segmented control: Describe a video | Paste a script
    sx, sy, sw, sh = W / 2 - 104, by + 10, 208, 22
    c.rect(sx, sy, sw, sh, t["recessed"], rx=7)
    c.rect(sx + 3, sy + 3, 104, 16, t["card"], rx=5)
    c.text(sx + 55, sy + 14.5, "Describe a video", 9.5, t["fg"], anchor="middle", weight=500)
    c.text(sx + 157, sy + 14.5, "Paste a script", 9.5, t["muted"], anchor="middle", weight=500)

    # the typewriter line: "Create " + rotating placeholder, then the user's own words
    tx, ty = bx + 18, by + 66
    ph = [
        ("a claymation children's story about little red riding hood…", 0.4, 2.6, 3.7, 4.4),
        ("a documentary-style video about the rise and fall of Rome…", 4.6, 6.7, 7.5, 8.1),
    ]
    c.text(tx, ty, "Create ", 12.5, t["muted"], cls=c.span(0, 8.3))
    cw = tw("Create ", 12.5) + 3
    for s, t0, t1, e0, e1 in ph:
        c.typewriter(tx + cw, ty, s, t0, t1, 12.5, t["muted"], erase=(e0, e1))
    user = "A storybook about Little Red and a very polite wolf."
    c.typewriter(tx, ty, user, 8.5, 10.6, 12.5, t["fg"], caret=True)

    # control row
    ry = by + bh - 32
    c.rect(bx + 16, ry + 1, 20, 20, "none", rx=10, stroke=t["border2"])
    c.icon("plus", bx + 20, ry + 5, 12, t["muted"])
    px = bx + 44
    px += c.pill(px, ry + 2, "16:9", 9, t["secondary"], t["fg"], icon="aspect-ratio", chevron=True, h=18, weight=400) + 6
    px += c.pill(px, ry + 2, "Auto", 9, t["secondary"], t["fg"], icon="translate", chevron=True, h=18, weight=400) + 6
    # model pill carries the OpenSlop mark
    mw = tw("Slop LLM v1", 9) + 34
    c.rect(px, ry + 2, mw, 18, t["secondary"], rx=5)
    c.provider_mark("openslop", px + 7, ry + 6, 10)
    c.text(px + 21, ry + 14.3, "Slop LLM v1", 9, t["fg"])
    c.icon("chevron-down", px + mw - 15, ry + 7, 8, t["muted"])
    px += mw + 6
    c.pill(px, ry + 2, "Auto", 9, t["secondary"], t["fg"], icon="hour-glass", chevron=True, h=18, weight=400)
    # submit: secondary until there is text, accent once the user presses enter
    sbx, sby = bx + bw - 38, ry
    c.rect(sbx, sby, 22, 22, t["secondary"], rx=6)
    c.icon("corner-down-left", sbx + 4, sby + 4, 14, t["accent"], opacity=0.35, cls=c.span(0, 8.5))
    c.icon("corner-down-left", sbx + 4, sby + 4, 14, t["accent"], cls=c.span(8.5, 11.2))
    pressed = c.span(11.2, 13)
    c.rect(sbx, sby, 22, 22, t["accent"], rx=6, cls=pressed)
    c.icon("corner-down-left", sbx + 4, sby + 4, 14, t["accentfg"], cls=pressed)
    # Sloppy picks it up
    took = c.appear(11.6, dy=3)
    c.orb(bx + bw - 118, by + bh + 8, 12, cls=took)
    c.text(bx + bw - 100, by + bh + 18, "Slopping… · 1s", 9.5, t["muted"], cls=took)

    c.text(W / 2, by + bh + 20, "Skip to a blank canvas", 10, t["muted"], anchor="middle", cls=c.span(0, 11.6))

    # Need inspiration? two real templates
    gy = 270
    c.text(bx, gy, "Need inspiration?", 10, t["muted"])
    cards = [
        ("POV Your Life as A...", "Second-person POV voiceover with cartoons…", "POV Life", "#F59E0B", ("#fbbf24", "#b45309")),
        ("Get Sleepy with...", "Slow, soothing narration to lull listeners…", "Sleep Story", "#6366F1", ("#818cf8", "#312e81")),
    ]
    for i, (title, desc, name, col, grad) in enumerate(cards):
        x = bx + i * 236
        y = gy + 8
        gid = f"tpl{i}"
        c.defs.append(f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{grad[0]}"/><stop offset="1" stop-color="{grad[1]}"/></linearGradient>')
        c.rect(x, y, 224, 60, t["card"], rx=10, stroke=t["border"])
        c.defs.append(f'<clipPath id="tplc{i}"><rect x="{x}" y="{y}" width="46" height="60" rx="10"/></clipPath>')
        c.raw(f'<g clip-path="url(#tplc{i})"><rect x="{x}" y="{y}" width="56" height="60" fill="url(#{gid})"/><circle cx="{x + 16}" cy="{y + 22}" r="7" fill="#ffffff" opacity="0.6"/><rect x="{x + 6}" y="{y + 34}" width="22" height="18" rx="4" fill="#ffffff" opacity="0.35"/></g>')
        c.text(x + 56, y + 18, title, 11, t["fg"], weight=600)
        c.icon("chevron-right", x + 206, y + 9, 10, t["muted"])
        c.text(x + 56, y + 33, desc, 8.5, t["muted"])
        c.pill(x + 56, y + 40, name, 8, col, "#ffffff", h=13, pad=5, weight=500)
    c.write()


# =====================================================================================
# 2. Sloppy — the copilot in the left panel
# =====================================================================================
def card_sloppy(theme):
    c = Card("sloppy", "Sloppy, the copilot", "A request goes into the Sloppy panel; it thinks, reads, outlines, writes the script, fits the clips, and the scenes land on the canvas as it works.", 14, theme)
    t = c.t
    c.bg()
    # rail
    rail = [("home", "Home", 26, False), ("layout", "Layout", 78, False), ("text-box", "Captions", 112, False), ("sliders-alt", "Properties", 146, False), ("insert-element", "Models", 180, False), ("history", "History", 214, False)]
    c.raw(f'<line x1="6" y1="60.5" x2="46" y2="60.5" stroke="{t["border"]}"/>')
    c.raw(f'<line x1="6" y1="296.5" x2="46" y2="296.5" stroke="{t["border"]}"/>')
    for ic, lab, y, sel in rail:
        c.icon(ic, 19, y, 14, t["muted"])
        c.text(26, y + 26, lab, 7.5, t["muted"], anchor="middle", weight=500)
    c.rect(6, 304, 40, 44, t["secondary"], rx=10)
    c.icon("robot-fill", 19, 312, 14, t["panellabel"])
    c.text(26, 338, "Sloppy", 7.5, t["panellabel"], anchor="middle", weight=600)

    # panel column
    PX, PW = 58, 240
    c.icon("robot-fill", PX, 12, 15, t["panellabel"])
    c.text(PX + 21, 24, "Sloppy", 13, t["panellabel"], weight=600)

    # transcript
    ub = c.appear(0.6)
    c.raw(f'<path class="{ub}" d="M{PX + 62} 38h{PW - 62 - 0}a10 10 0 0 1 10 10v20a3 3 0 0 1 -3 3h-{PW - 62 - 3}a10 10 0 0 1 -10 -10v-13a10 10 0 0 1 10 -10z" fill="{t["primary"]}"/>')
    c.text(PX + 74, 53, "make it a storybook about little", 10, t["primaryfg"], cls=ub)
    c.text(PX + 74, 66, "red riding hood, four scenes", 10, t["primaryfg"], cls=ub)

    def status(y, t0, t1, label):
        s = c.span(t0, t1, fade=0.1)
        c.orb(PX + 2, y - 9, 12, cls=s)
        c.text(PX + 19, y, label, 9.5, t["muted"], cls=s + " " + c.pulse(1.6, 0.55))

    def step(y, t0, icon, label):
        a = c.appear(t0)
        c.icon("chevron-right", PX + 2, y - 8, 8, t["muted"], cls=a)
        c.icon(icon, PX + 13, y - 9, 10, t["muted"], cls=a)
        c.text(PX + 28, y, label, 9.5, t["fg"], cls=a)
        return a

    def outcome(y, t0, s):
        a = c.appear(t0, dy=2)
        c.raw(f'<line class="{a}" x1="{PX + 8}" y1="{y - 9}" x2="{PX + 8}" y2="{y + 3}" stroke="{t["border2"]}"/>')
        c.text(PX + 16, y, s, 8.5, t["muted"], cls=a, extra='opacity="0.8"')

    status(96, 1.2, 2.0, "Slopping… · 1s")
    # Thinking… → Done thinking
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
    outcome(160, 4.9, "Four scenes: kitchen, forest path, cottage, sunset.")
    status(178, 4.6, 5.8, "Slopping… · 5s")
    step(178, 5.8, "film", "Writing a new script")
    outcome(192, 8.4, "Wrote 4 scenes with 14 elements.")
    status(210, 5.8, 8.8, "Applying changes · 8s")
    step(210, 8.8, "hour-glass", "Fitting clips to the dialogue")
    outcome(224, 9.1, "Trimmed 3 visuals to their narration.")
    status(242, 8.8, 10.2, "Slopping… · 11s")
    rp = c.appear(10.2)
    c.rect(PX, 232, PW, 48, t["elcard"], rx=10, cls=rp)
    c.text(PX + 10, 247, "ok boss! little red is on the canvas, four", 9.5, t["fg"], cls=rp)
    c.text(PX + 10, 259, "scenes with red, mother and the wolf. hit", 9.5, t["fg"], cls=rp)
    c.text(PX + 10, 271, "generate all whenever you're ready", 9.5, t["fg"], cls=rp)
    wk = c.appear(10.8)
    c.icon("magic", PX + 3, 286, 10, t["muted"], cls=wk)
    c.text(PX + 18, 295, "Worked for 12s", 9, t["muted"], cls=wk)

    # composer
    cy = 306
    c.shadow(PX, cy, PW, 44, 10, 0.5)
    c.rect(PX, cy, PW, 44, t["elcard"], rx=10)
    c.text(PX + 10, cy + 15, "Write or change the script…", 9.5, t["muted"])
    c.provider_mark("openslop", PX + 10, cy + 26, 10)
    c.text(PX + 24, cy + 34.5, "Slop LLM v1", 9, t["muted"])
    c.icon("chevron-down", PX + 24 + tw("Slop LLM v1", 9) + 3, cy + 27, 8, t["muted"])
    c.icon("lightbulb", PX + 92, cy + 25, 11, t["muted"])
    c.rect(PX + PW - 30, cy + 20, 20, 20, t["secondary"], rx=6)
    c.icon("corner-down-left", PX + PW - 27, cy + 23, 14, t["accent"], opacity=0.4)

    # the canvas on the right, filling in as the script streams
    SX, SY, SW, SH = 312, 8, 320, 344
    c.stage(SX, SY, SW, SH)
    c.text(SX + 14, SY + 30, "Start typing your story…", 10, t["muted"], cls=c.span(0, 5.9))
    title = c.appear(6.0)
    c.text(SX + 14, SY + 30, "Little Red", 15, t["fg"], weight=600, cls=title)

    def scene_head(y, n, rng, dur, t0):
        a = c.appear(t0)
        c.icon("chevron-down", SX + 12, y - 9, 10, t["muted"], cls=a)
        c.text(SX + 26, y, f"Scene {n}", 9, t["muted"], weight=500, cls=a)
        c.text(SX + 66, y, rng, 9, t["muted"], cls=a)
        c.rect(SX + 118, y - 9, 20, 12, t["secondary"], rx=3, cls=a)
        c.text(SX + 128, y, dur, 8, t["muted"], anchor="middle", cls=a)

    def compact(y, kind, s, t0):
        a = c.appear(t0)
        tint = t["m_" + kind]
        icon = {"narration": "voice", "character": "user", "image": "image", "animated": "motion", "clip": "video", "sound": "wave-sine", "music": "music"}[kind]
        c.rect(SX + 14, y - 11, 16, 16, t["secondary"], rx=4, cls=a)
        c.icon(icon, SX + 17, y - 8, 10, tint, cls=a)
        c.text(SX + 36, y, s, 9, t["muted"], cls=a)

    scene_head(SY + 56, 1, "0:00 – 0:11", "11s", 6.2)
    compact(SY + 76, "image", "Inside a sunlit kitchen with copper pots hanging…", 6.4)
    compact(SY + 96, "narration", "Once upon a time, in a village at the edge of a…", 6.9)
    compact(SY + 116, "character", "Mother: “Take these straight to Granny, sweet…", 7.4)
    compact(SY + 136, "music", "Gentle, playful orchestral music with flutes…", 7.8)
    c.raw(f'<line class="{c.appear(8.0)}" x1="{SX + 14}" y1="{SY + 152}" x2="{SX + SW - 14}" y2="{SY + 152}" stroke="{t["border"]}"/>')
    scene_head(SY + 172, 2, "0:11 – 0:19", "8s", 8.0)
    compact(SY + 192, "animated", "Red skips down a winding forest path, sunlight…", 8.2)
    compact(SY + 212, "narration", "The forest was full of tall trees and soft moss…", 8.5)
    compact(SY + 232, "sound", "birds chirping", 8.8)
    c.raw(f'<line class="{c.appear(9.0)}" x1="{SX + 14}" y1="{SY + 248}" x2="{SX + SW - 14}" y2="{SY + 248}" stroke="{t["border"]}"/>')
    scene_head(SY + 268, 3, "0:19 – 0:28", "9s", 9.0)
    compact(SY + 288, "clip", "A wolf steps out from behind an oak, tilting his…", 9.2)
    compact(SY + 308, "character", "Wolf: “Good morning, little one. Where are you…", 9.5)
    c.text(SX + 36, SY + 328, "+2 more", 8, t["muted"], cls=c.appear(9.8))
    c.write()


# =====================================================================================
# 3. The storyboard canvas — scenes, elements, the seven types
# =====================================================================================
def card_canvas(theme):
    c = Card("canvas", "A storyboard you can edit", "A scene holds element cards; hovering a row shows the insert control, its menu lists the seven element types, and a new Sound card appears where it was picked.", 12, theme)
    t = c.t
    c.bg()
    SX, SY, SW, SH = 8, 8, 624, 344
    c.stage(SX, SY, SW, SH)
    c.text(SX + 40, SY + 26, "Little Red", 15, t["fg"], weight=600)

    # assets row
    ay = SY + 36
    c.icon("chevron-down", SX + 40, ay - 1, 10, t["muted"])
    c.text(SX + 54, ay + 7, "Assets", 8.5, t["muted"], weight=500)
    tiles = [("Art style", "magic", None), ("Narrator", "voice", None), ("Red", None, "R"), ("Mother", None, "M"), ("Character", "user", "+"), ("Reference", "image", "+")]
    for i, (lab, ic, init) in enumerate(tiles):
        x = SX + 40 + i * 40
        y = ay + 11
        dashed = init == "+"
        c.rect(x, y, 30, 30, t["secondary"] if dashed else t["card"], rx=6, stroke=t["border2"], extra='stroke-dasharray="3 2"' if dashed else "")
        if dashed:
            c.icon(ic, x + 8, y + 8, 14, t["muted"])
            c.raw(f'<circle cx="{x + 23}" cy="{y + 7}" r="4.5" fill="{t["secondary"]}"/>')
            c.icon("plus", x + 19, y + 3, 8, t["muted"])
        elif ic:
            c.icon(ic, x + 8, y + 8, 14, t["muted"])
        else:
            c.text(x + 15, y + 20, init, 12, t["fg"], anchor="middle", weight=600)
        c.text(x + 15, y + 39, lab, 7, t["muted"], anchor="middle")

    # scene header
    sy = SY + 100
    c.icon("chevron-down", SX + 40, sy - 8, 10, t["muted"])
    c.text(SX + 54, sy, "Scene 1", 9, t["muted"], weight=500)
    c.text(SX + 94, sy, "0:00 – 0:11", 9, t["muted"])
    c.rect(SX + 148, sy - 9, 20, 12, t["secondary"], rx=3)
    c.text(SX + 158, sy, "11s", 8, t["muted"], anchor="middle")
    for i, ic in enumerate(("magic", "play", "x")):
        c.rect(SX + SW - 100 + i * 26, sy - 12, 20, 20, t["secondary"], rx=6, opacity=0.6)
        c.icon(ic, SX + SW - 96 + i * 26, sy - 8, 12, t["muted"], opacity=0.7)

    CX, CW = SX + 40, 330  # card column
    PXX = SX + 400  # preview column
    KIND_ICON = {"narration": "voice", "character": "user", "image": "image", "animated": "motion", "clip": "video", "sound": "wave-sine", "music": "music"}

    def element(y, h, kind, label, model, prompt_lines, cls="", placeholder=False, footer=False):
        c.raw("<g>" if not cls else "".join(f'<g class="{k}">' for k in cls.split()))
        c.rect(CX, y, CW, h, t["elcard"], rx=10, stroke=t["border"])
        w = c.type_pill(CX + 8, y + 8, kind, label)
        x = CX + 8 + w + 6
        if model:
            x += c.model_badge(x, y + 8, model) + 4
        c.icon("sliders", CX + CW - 26, y + 11, 12, t["muted"], opacity=0.8)
        if kind in ("narration", "character"):
            c.icon("voice", CX + CW - 44, y + 11, 12, t["muted"], opacity=0.8)
        ih = (h - 40) if not footer else (h - 62)
        c.rect(CX + 8, y + 30, CW - 16, ih, t["elinput"], rx=7)
        for i, ln in enumerate(prompt_lines):
            c.text(CX + 16, y + 43 + i * 12, ln, 9, t["muted"] if placeholder else t["fg"])
        c.raw(f'<line x1="{CX + CW + 14}" y1="{y + 6}" x2="{CX + CW + 14}" y2="{y + h - 6}" stroke="{t["border"]}"/>')
        c.raw("</g>" * max(1, len(cls.split())))

    # image
    y1 = SY + 110
    element(y1, 62, "image", "Image", "Slop Image v1", ["Inside a sunlit kitchen with copper pots hanging on", "the wall, Mother places a wicker basket in Red's hands."])
    c.rect(PXX, y1 + 2, 104, 58, t["card"], rx=6, stroke=t["border"])
    c.defs.append(f'<clipPath id="kit"><rect x="{PXX + 1}" y="{y1 + 3}" width="102" height="56" rx="5"/></clipPath>')
    c.raw(
        f'<g clip-path="url(#kit)"><rect x="{PXX}" y="{y1}" width="106" height="62" fill="#e9c98f"/><rect x="{PXX}" y="{y1 + 40}" width="106" height="22" fill="#a4703f"/>'
        f'<rect x="{PXX + 8}" y="{y1 + 10}" width="26" height="18" rx="2" fill="#f7e9c6"/><circle cx="{PXX + 74}" cy="{y1 + 36}" r="8" fill="#d94a3a"/><circle cx="{PXX + 74}" cy="{y1 + 25}" r="5.5" fill="#f2c9a2"/>'
        f'<circle cx="{PXX + 50}" cy="{y1 + 40}" r="7" fill="#6b7fb0"/><circle cx="{PXX + 50}" cy="{y1 + 29}" r="5" fill="#f2c9a2"/><rect x="{PXX + 57}" y="{y1 + 43}" width="16" height="9" rx="3" fill="#c98b4a"/></g>'
    )
    # narration
    y2 = y1 + 68
    element(y2, 44, "narration", "Narration", None, ["Once upon a time, in a village at the edge of a great forest,"])
    c.rect(PXX, y2 + 3, 200, 38, t["elcard"], rx=6, stroke=t["border"])
    c.icon("play", PXX + 8, y2 + 15, 14, t["fg"])
    c.waveform(PXX + 28, y2 + 11, 124, 22, t["muted"], seed=2)
    c.text(PXX + 192, y2 + 26, "0:00/0:06", 7.5, t["muted"], anchor="end")
    # music, which slides down when Sound is inserted
    y3 = y2 + 50
    SH_ = 66
    shifted = c.shift(5.9, dy=SH_)
    element(y3, 44, "music", "Music", "Slop Music v1", ["Gentle, playful orchestral music with flutes and strings"], cls=shifted)
    c.raw(f'<g class="{shifted}">')
    c.rect(PXX, y3 + 3, 200, 38, t["elcard"], rx=6, stroke=t["border"])
    c.icon("play", PXX + 8, y3 + 15, 14, t["fg"])
    c.waveform(PXX + 28, y3 + 11, 124, 22, t["m_music"], seed=5, opacity=0.8)
    c.text(PXX + 192, y3 + 26, "0:00/0:11", 7.5, t["muted"], anchor="end")
    c.raw("</g>")

    # hover gutter on the narration row → insert menu → Sound
    hv = c.span(3.0, 5.9)
    c.icon("plus", SX + 15, y2 + 6, 16, t["muted"], cls=hv)
    c.raw(c.wrap(f'<g color="{t["muted"]}" transform="translate({SX + 17},{y2 + 24}) scale(0.8)"><circle cx="5" cy="4" r="1.3" fill="currentColor"/><circle cx="11" cy="4" r="1.3" fill="currentColor"/><circle cx="5" cy="9" r="1.3" fill="currentColor"/><circle cx="11" cy="9" r="1.3" fill="currentColor"/><circle cx="5" cy="14" r="1.3" fill="currentColor"/><circle cx="11" cy="14" r="1.3" fill="currentColor"/></g>', hv))
    menu = c.span(3.8, 5.8, fade=0.1)
    mx, my = SX + 30, y2 + 28
    c.shadow(mx, my, 132, 128, 8, 0.8, cls=menu)
    c.rect(mx, my, 132, 128, t["card"], rx=8, stroke=t["border"], cls=menu)
    types = [("narration", "Narration"), ("character", "Character"), ("image", "Image"), ("animated", "Animated image"), ("clip", "Clip"), ("sound", "Sound"), ("music", "Music")]
    for i, (k, lab) in enumerate(types):
        ry = my + 6 + i * 17
        if k == "sound":
            c.rect(mx + 4, ry - 1, 124, 16, t["secondary"], rx=4, cls=c.span(5.0, 5.8, fade=0.1))
        c.rect(mx + 8, ry + 1, 12, 12, mix(t["card"], t["m_" + k], 0.15), rx=3, cls=menu)
        c.icon(KIND_ICON[k], mx + 10, ry + 3, 8, t["m_" + k], cls=menu)
        c.text(mx + 26, ry + 11, lab, 9, t["fg"], cls=menu)
    # cursor: rests on the gutter, then travels to the Sound row
    cur = c.span(3.0, 5.8, fade=0.1) + " " + c.shift(4.2, dx=52, dy=108, dur=0.7)
    c.raw(c.wrap(f'<path transform="translate({SX + 20},{y2 + 12})" d="M0 0l0 14 4-3.5 2.6 5.6 2.4-1.1-2.6-5.6h5z" fill="{t["fg"]}" stroke="{t["bg"]}" stroke-width="1"/>', cur))

    # the new Sound card, with its footer
    ys = y3
    grp = c.appear(6.0)
    element(ys, 60, "sound", "Sound", "Slop SFX v1", [], cls=grp)
    c.text(CX + 16, ys + 43, "Describe the sound effect...", 9, t["muted"], cls=c.span(6.0, 7.0, fade=0.05))
    c.typewriter(CX + 16, ys + 43, "birds chirping, distant and cheerful", 7.1, 8.6, 9, t["fg"], cls=grp)
    c.button(CX + CW - 8 - 64, ys + 60 - 24, "Generate", icon="magic", h=18, size=8.5, pad=7, cls=grp)
    c.raw(f'<g class="{grp}">')
    c.rect(PXX, ys + 3, 200, 38, t["secondary"], rx=6, stroke=t["border"])
    c.raw('<g opacity="0.45" filter="url(#blur)">')
    c.balls(PXX, ys + 3, 200, 38, animate=False)
    c.raw("</g></g>")
    c.defs.append('<filter id="blur"><feGaussianBlur stdDeviation="3"/></filter>')
    c.write()


# =====================================================================================
# 4. Generate everything — the queue, dependencies, and stale detection
# =====================================================================================
def card_generate(theme):
    c = Card("generate", "One click generates everything", "Generate all queues every element, runs dependencies first, fills in previews, then flags an edited prompt as stale with a reason.", 14, theme)
    t = c.t
    c.bg()
    # toolbar
    c.raw(f'<line x1="0" y1="34.5" x2="{W}" y2="34.5" stroke="{t["border"]}"/>')
    c.icon("lock", 258, 11, 11, t["muted"])
    c.text(273, 21, "Personal", 10, t["muted"])
    c.text(320, 21, "/", 10, t["faint"])
    c.text(328, 21, "Little Red", 10, t["fg"], weight=500)
    # export button
    c.button(566, 6, "Export", icon="download", variant="panel", size=9.5, h=22, pad=8)
    # generate button states
    bx = 440
    states = [
        (0, 1.2, "Generate 7 elements", "magic", False),
        (1.2, 8.2, "Generating…", "spinner", True),
        (8.2, 10.4, "All generated", "check", False),
        (10.4, 14, "Regenerate 1 element", "rotate-ccw", False),
    ]
    for t0, t1, lab, ic, spin in states:
        s = c.span(t0, t1, fade=0.08)
        w = 18 + tw(lab, 9.5, 500) + 17.5
        x = 558 - w
        c.button(x, 6, lab, icon=ic, size=9.5, h=22, pad=9, cls=s, icon_cls=(s + " " + c.spin(1.0)) if spin else s)
        if spin:
            c.raw(f'<circle class="{s}" cx="{x - 16}" cy="17" r="10" fill="{t["secondary"]}"/>')
            c.icon("x", x - 21, 12, 10, t["muted"], cls=s)
        if t0 == 0:
            c.rect(x - 2, 4, w + 4, 26, "none", rx=8, stroke=t["accent"], sw=1.5, cls=c.span(0.9, 1.3, fade=0.1))

    SX, SY, SW, SH = 8, 44, 624, 308
    c.stage(SX, SY, SW, SH)
    sy = SY + 22
    c.icon("chevron-down", SX + 14, sy - 8, 10, t["muted"])
    c.text(SX + 28, sy, "Scene 2", 9, t["muted"], weight=500)
    c.text(SX + 68, sy, "0:11 – 0:19", 9, t["muted"])
    c.rect(SX + 120, sy - 9, 18, 12, t["secondary"], rx=3)
    c.text(SX + 129, sy, "8s", 8, t["muted"], anchor="middle")

    CX, CW = SX + 14, 340
    PXX = SX + 384
    rows = [
        # y, h, kind, label, model, extra badge, prompt, preview kind
        (SY + 34, 88, "animated", "Animated image", "Slop Video v1", ("Slop Image v1", "image"), ["Red skips down a winding forest path, sunlight", "through the leaves, basket swinging."], "media"),
        (SY + 128, 76, "narration", "Narration", None, None, ["The forest was full of tall trees and soft moss, and", "Red knew the path by heart."], "audio"),
        (SY + 210, 76, "sound", "Sound", "Slop SFX v1", None, ["birds chirping"], "audio"),
    ]
    # timing per row: queued at 1.3; generating start; done
    timing = {"animated": (1.6, 6.8), "narration": (1.6, 4.6), "sound": (4.6, 7.6)}

    for y, h, kind, label, model, badge, lines, pk in rows:
        c.rect(CX, y, CW, h, t["elcard"], rx=10, stroke=t["border"])
        w = c.type_pill(CX + 8, y + 8, kind, label)
        x = CX + 8 + w + 6
        if model:
            x += c.model_badge(x, y + 8, model) + 4
        if badge:
            x += c.model_badge(x, y + 8, badge[0], icon_name=badge[1]) + 4
        c.icon("sliders", CX + CW - 26, y + 11, 12, t["muted"], opacity=0.8)
        c.rect(CX + 8, y + 30, CW - 16, h - 60, t["elinput"], rx=7)
        for i, ln in enumerate(lines):
            if kind == "animated" and i == 1:
                # the prompt gets an edit late in the loop: the line is retyped from where it ended
                c.text(CX + 16, y + 55, ln, 9, t["fg"], cls=c.span(0, 10.0, fade=0))
                c.typewriter(CX + 16, y + 55, ln[:-1] + " at golden hour.", 10.0, 10.5, 9, t["fg"], start=len(ln) - 1, cls=c.span(10.0, 14, fade=0))
            else:
                c.text(CX + 16, y + 43 + i * 12, ln, 9, t["fg"])
        c.raw(f'<line x1="{CX + CW + 16}" y1="{y + 6}" x2="{CX + CW + 16}" y2="{y + h - 6}" stroke="{t["border"]}"/>')
        g0, g1 = timing[kind]
        # footer: Generate → Queued → Generating… → Regenerate  (+ Stale on the animated card)
        fx = CX + CW - 8
        fy = y + h - 24
        for t0, t1, lab, ic, spin in ((0, 1.3, "Generate", "magic", False), (1.3, g0, "Queued", "hour-glass", False), (g0, g1, "Generating…", "spinner", True), (g1, 14, "Regenerate", "magic", False)):
            if t1 <= t0:
                continue
            s = c.span(t0, t1, fade=0.08)
            bw = tw(lab, 8.5) + 14 + 16.5
            c.button(fx - bw, fy, lab, icon=ic, h=18, size=8.5, pad=7, cls=s, icon_cls=(s + " " + c.spin(1.0)) if spin else s)
        if kind == "animated":
            st = c.appear(10.6)
            bw = c.badge(fx - 70 - 62, fy + 1, "Stale", "tertiary", icon="alert", cls=st)
            # tooltip with the reason
            tip = c.span(11.0, 13.6)
            tipw = tw("The prompt changed — regenerate to update", 8.5) + 22
            tx = fx - 70 - 62 - tipw - 12
            c.rect(tx, fy, tipw, 18, t["fg"], rx=5, cls=tip)
            c.raw(c.wrap(f'<path d="M{tx + tipw} {fy + 5}l4 4-4 4z" fill="{t["fg"]}"/>', tip))
            c.text(tx + 8, fy + 12.3, "The prompt changed — regenerate to update", 8.5, t["bg"], cls=tip)
        # preview
        if pk == "media":
            pw, ph = 150, 84
            c.rect(PXX, y + 2, pw, ph, t["card"], rx=6, stroke=t["border"])
            c.balls(PXX + 1, y + 3, pw - 2, ph - 2, cls=c.span(0, g1, fade=0.05))
            done = c.appear(g1, dy=0, fade=0.5)
            fid = "forest"
            c.defs.append(f'<clipPath id="{fid}"><rect x="{PXX + 1}" y="{y + 3}" width="{pw - 2}" height="{ph - 2}" rx="5"/></clipPath>')
            c.defs.append('<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d58a"/><stop offset="1" stop-color="#8fb36b"/></linearGradient>')
            c.raw(
                f'<g class="{done}" clip-path="url(#{fid})"><rect x="{PXX}" y="{y}" width="{pw + 2}" height="{ph + 4}" fill="url(#sky)"/>'
                f'<path d="M{PXX} {y + 60}q40 -10 75 0t75 -6v34h-150z" fill="#6f8f4a"/>'
                f'<path d="M{PXX + 60} {y + 86}q10 -30 16 -50q6 20 16 50z" fill="#c9a86a" opacity="0.8"/>'
                f'<polygon points="{PXX + 18},{y + 62} {PXX + 32},{y + 18} {PXX + 46},{y + 62}" fill="#3f6b3a"/><polygon points="{PXX + 108},{y + 60} {PXX + 122},{y + 12} {PXX + 136},{y + 60}" fill="#3f6b3a"/>'
                f'<circle cx="{PXX + 76}" cy="{y + 56}" r="6" fill="#d94a3a"/><circle cx="{PXX + 76}" cy="{y + 48}" r="3.6" fill="#f2c9a2"/></g>'
            )
            # Video | Still toggle once done
            c.rect(PXX + pw - 62, y + 6, 58, 14, mix(t["onmedia"], "#000000", 0), rx=4, opacity=0.6, cls=done)
            c.text(PXX + pw - 48, y + 16, "Video", 7.5, "#ffffff", anchor="middle", weight=500, cls=done)
            c.text(PXX + pw - 19, y + 16, "Still", 7.5, "#ffffff", anchor="middle", weight=500, cls=done, extra='opacity="0.6"')
        else:
            pw, ph = 200, 40
            py = y + (h - ph) / 2 - 6
            c.rect(PXX, py, pw, ph, t["secondary"], rx=6, stroke=t["border"], cls=c.span(0, g1, fade=0.05))
            c.raw(f'<g class="{c.span(0, g1, fade=0.05)}" opacity="0.45" filter="url(#blur)">')
            c.balls(PXX, py, pw, ph, animate=False)
            c.raw("</g>")
            done = c.appear(g1, dy=0, fade=0.4)
            c.rect(PXX, py, pw, ph, t["elcard"], rx=6, stroke=t["border"], cls=done)
            c.icon("play", PXX + 8, py + 13, 14, t["fg"], cls=done)
            c.waveform(PXX + 28, py + 8, 124, 24, t["m_" + kind] if kind != "narration" else t["muted"], seed=3 if kind == "sound" else 7, cls=done, opacity=0.85)
            c.text(PXX + 192, py + 24, "0:00/0:07" if kind == "narration" else "0:00/0:03", 7.5, t["muted"], anchor="end", cls=done)
        # GenerationIndicator chip on the preview
        chip_x, chip_y = PXX + 6, (y + 8 if pk == "media" else y + (h - 40) / 2)
        q = c.span(1.3, g0, fade=0.05)
        c.raw(f'<circle class="{q}" cx="{chip_x + 10}" cy="{chip_y + 10}" r="10" fill="{t["onmedia"]}" opacity="0.55"/>')
        c.icon("hour-glass", chip_x + 5, chip_y + 5, 10, "#ffffff", cls=q + " " + c.pulse(1.2, 0.5))
        gen = c.span(g0, g1, fade=0.05)
        gw = 84
        c.rect(chip_x, chip_y, gw, 20, t["onmedia"], rx=10, opacity=0.55, cls=gen)
        c.icon("spinner", chip_x + 5, chip_y + 5, 10, "#ffffff", cls=gen + " " + c.spin(1.0))
        # live seconds
        secs = int(g1 - g0)
        for i in range(secs):
            c.text(chip_x + 19, chip_y + 13.5, f"Generating {i + 1}s", 7.5, "#ffffff", cls=c.span(g0 + i, g0 + i + 1, fade=0.0), weight=500)
    c.defs.append('<filter id="blur"><feGaussianBlur stdDeviation="3"/></filter>')
    c.write()


# =====================================================================================
# 5. Player and timeline
# =====================================================================================
def card_timeline(theme):
    c = Card("timeline", "Player and timeline", "The player plays the cut with word-by-word captions while the playhead sweeps a four-lane timeline of video, voice, effects, and music clips.", 12, theme)
    t = c.t
    c.bg()
    c.stage(8, 8, 624, 344)
    # ---- player
    vw, vh = 232, 130
    vx, vy = (W - vw) / 2, 14
    c.rect(vx - 1, vy - 1, vw + 2, vh + 2, t["card"], rx=7, stroke=t["border"])
    c.defs.append(f'<clipPath id="vid"><rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" rx="6"/></clipPath>')
    scenes = [(0, 4), (4, 7), (7, 10), (10, 12)]
    arts = []
    # scene 1: kitchen
    arts.append(
        f'<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="#e9c98f"/><rect x="{vx}" y="{vy + 84}" width="{vw}" height="{vh - 84}" fill="#a4703f"/>'
        f'<rect x="{vx + 20}" y="{vy + 18}" width="52" height="40" rx="3" fill="#f7e9c6"/><circle cx="{vx + 150}" cy="{vy + 76}" r="16" fill="#d94a3a"/><circle cx="{vx + 150}" cy="{vy + 52}" r="11" fill="#f2c9a2"/>'
        f'<circle cx="{vx + 104}" cy="{vy + 82}" r="14" fill="#6b7fb0"/><circle cx="{vx + 104}" cy="{vy + 60}" r="10" fill="#f2c9a2"/><rect x="{vx + 118}" y="{vy + 90}" width="30" height="16" rx="4" fill="#c98b4a"/>'
    )
    # scene 2: forest path
    arts.append(
        f'<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="url(#sky2)"/><path d="M{vx} {vy + 90}q60 -14 116 0t116 -8v50h-232z" fill="#6f8f4a"/>'
        f'<path d="M{vx + 92} {vy + 132}q14 -40 24 -70q10 30 26 70z" fill="#c9a86a" opacity="0.85"/>'
        f'<polygon points="{vx + 20},{vy + 96} {vx + 44},{vy + 24} {vx + 68},{vy + 96}" fill="#3f6b3a"/><polygon points="{vx + 170},{vy + 92} {vx + 194},{vy + 14} {vx + 218},{vy + 92}" fill="#3f6b3a"/>'
        f'<circle cx="{vx + 116}" cy="{vy + 84}" r="9" fill="#d94a3a"/><circle cx="{vx + 116}" cy="{vy + 71}" r="6" fill="#f2c9a2"/>'
    )
    # scene 3: wolf under the oak
    arts.append(
        f'<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="#2f4a3a"/><rect x="{vx}" y="{vy + 92}" width="{vw}" height="{vh - 92}" fill="#40613f"/>'
        f'<rect x="{vx + 40}" y="{vy + 20}" width="22" height="80" fill="#5a3d2a"/><circle cx="{vx + 51}" cy="{vy + 22}" r="34" fill="#3f6b3a"/>'
        f'<ellipse cx="{vx + 150}" cy="{vy + 92}" rx="30" ry="14" fill="#6a6a70"/><circle cx="{vx + 176}" cy="{vy + 78}" r="11" fill="#6a6a70"/><polygon points="{vx + 170},{vy + 70} {vx + 174},{vy + 60} {vx + 178},{vy + 70}" fill="#6a6a70"/><circle cx="{vx + 180}" cy="{vy + 76}" r="1.6" fill="#f7d58a"/>'
        f'<circle cx="{vx + 100}" cy="{vy + 90}" r="8" fill="#d94a3a"/><circle cx="{vx + 100}" cy="{vy + 78}" r="5.5" fill="#f2c9a2"/>'
    )
    # scene 4: the cottage at sunset
    arts.append(
        f'<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="url(#sky4)"/><circle cx="{vx + 60}" cy="{vy + 50}" r="16" fill="#ffd27a"/><rect x="{vx}" y="{vy + 96}" width="{vw}" height="{vh - 96}" fill="#4d6a3c"/>'
        f'<rect x="{vx + 124}" y="{vy + 56}" width="70" height="44" fill="#b8865a"/><polygon points="{vx + 118},{vy + 58} {vx + 159},{vy + 30} {vx + 200},{vy + 58}" fill="#7a4a2e"/><rect x="{vx + 150}" y="{vy + 74}" width="16" height="26" fill="#5a3d2a"/><rect x="{vx + 132}" y="{vy + 66}" width="12" height="12" fill="#ffe4a1"/>'
        f'<circle cx="{vx + 96}" cy="{vy + 92}" r="7" fill="#d94a3a"/><circle cx="{vx + 96}" cy="{vy + 82}" r="5" fill="#f2c9a2"/>'
    )
    c.defs.append('<linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d58a"/><stop offset="1" stop-color="#8fb36b"/></linearGradient>')
    c.defs.append('<linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f58c5a"/><stop offset="1" stop-color="#f5c27a"/></linearGradient>')
    for (a, b), art in zip(scenes, arts):
        c.raw(f'<g class="{c.span(a, b, fade=0.4)}" clip-path="url(#vid)">{art}</g>')
    # captions: Classic preset, word by word, bottom center
    lines = [((0, 4), ["Once", "upon", "a", "time,", "in", "a", "village"]), ((4, 7), ["The", "forest", "was", "full", "of", "tall", "trees"]), ((7, 10), ["Good", "morning,", "little", "one."]), ((10, 12), ["Granny's", "cottage", "at", "last."])]
    for (a, b), words in lines:
        per = (b - a - 0.6) / len(words)
        spans = "".join(f'<tspan class="{c.span(a + i * per, b, fade=0.05)}">{html.escape(wd)}{" " if i < len(words) - 1 else ""}</tspan>' for i, wd in enumerate(words))
        c.raw(f'<text x="{W / 2}" y="{vy + vh - 12}" font-family="{SANS}" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" stroke="#000000" stroke-width="2.2" paint-order="stroke fill" stroke-linejoin="round" style="white-space:pre">{spans}</text>')

    # ---- transport bar
    ty = 156
    segs = [4, 3, 3, 2]
    total = sum(segs)
    bx, bw = 20, 600
    px = 0
    c.defs.append('<clipPath id="segs">' + "".join(f'<rect x="{bx + sum(segs[:i]) / total * bw + (1 if i else 0)}" y="{ty}" width="{s / total * bw - (2 if i < 3 else 1)}" height="4" rx="2"/>' for i, s in enumerate(segs)) + "</clipPath>")
    c.raw(f'<g clip-path="url(#segs)"><rect x="{bx}" y="{ty}" width="{bw}" height="4" fill="{t["scrubtrack"]}"/><rect class="{c.grow(0, 12)}" x="{bx}" y="{ty}" width="{bw}" height="4" fill="{t["scrubprog"]}"/></g>')
    # thumb follows the playhead
    c.raw(f'<g class="{c.slide(0, 12, bw)}"><circle cx="{bx}" cy="{ty + 2}" r="4" fill="{t["scrubprog"]}" stroke="{t["border2"]}" stroke-width="1.5"/></g>')
    ry = ty + 20
    for s in range(12):
        c.text(bx, ry, f"0:{s:02d}", 9.5, t["fg"], cls=c.span(s, s + 1, fade=0), weight=500)
    c.text(bx + 24, ry, " / 0:12", 9.5, t["muted"])
    for (a, b), n in zip(scenes, (1, 2, 3, 4)):
        s = c.span(a, b, fade=0)
        c.rect(bx + 62, ry - 10, 42, 14, t["secondary"], rx=3, stroke=t["border"], cls=s)
        c.text(bx + 83, ry, f"Scene {n}", 8.5, t["fg"], anchor="middle", cls=s)
    c.icon("chevrons-left", W / 2 - 34, ry - 11, 13, t["fg"])
    c.icon("pause", W / 2 - 6, ry - 11, 13, t["fg"])
    c.icon("chevrons-right", W / 2 + 21, ry - 11, 13, t["fg"])
    c.icon("volume-2", 546, ry - 11, 13, t["fg"])
    c.rect(564, ry - 5, 30, 2, t["scrubtrack"], rx=1)
    c.rect(564, ry - 5, 22, 2, t["scrubprog"], rx=1)
    c.icon("maximize", 600, ry - 11, 13, t["fg"])
    c.icon("timeline", 618, ry - 11, 13, t["fg"])

    # ---- timeline
    TY = 194
    gx = 20  # gutter
    GW = 30
    lx = gx + GW
    LW = 600 - GW
    pps = (LW - 16) / total
    c.raw(f'<line x1="{gx}" y1="{TY + 0.5}" x2="{620}" y2="{TY + 0.5}" stroke="{t["border"]}"/>')
    c.icon("zoom-out", gx + 2, TY + 5, 10, t["muted"])
    c.icon("zoom-in", gx + 15, TY + 5, 10, t["muted"])
    c.raw(f'<line x1="{lx - 0.5}" y1="{TY}" x2="{lx - 0.5}" y2="{344}" stroke="{t["border"]}"/>')
    # ruler: dotted, labels every 2s
    RH = 20
    for s in range(0, total * 5 + 1):
        x = lx + s * pps / 5
        c.raw(f'<circle cx="{x:.1f}" cy="{TY + RH - 4}" r="0.8" fill="{t["border2"]}"/>')
    for s in range(0, total + 1, 2):
        x = lx + s * pps
        c.text(x if s else x + 1, TY + 12, f"0:{s:02d}", 8, t["muted"], anchor="middle" if s else "start")
    c.raw(f'<line x1="{lx}" y1="{TY + RH + 0.5}" x2="620" y2="{TY + RH + 0.5}" stroke="{t["border"]}"/>')
    lanes = [("film", 44), ("voice", 32), ("wave-sine", 28), ("music", 28)]
    ly = TY + RH + 1
    lane_y = {}
    for name, h in lanes:
        lane_y[name] = ly
        c.icon(name, gx + 8, ly + h / 2 - 6, 12, t["muted"])
        c.raw(f'<line x1="{gx}" y1="{ly + h + 0.5}" x2="620" y2="{ly + h + 0.5}" stroke="{t["border"]}" stroke-opacity="0.6"/>')
        ly += h + 1

    def clip(lane, a, b, kind, label, scene=None, art=None, wave_seed=None, sel=False):
        y = lane_y[lane]
        h = dict(lanes)[lane]
        x = lx + a * pps
        w = (b - a) * pps - 2
        tint = t["m_" + kind]
        c.rect(x, y + 2, w, h - 4, mix(t["elcard"], tint, 0.22), rx=4, stroke=t["border"])
        ic = {"narration": "voice", "character": "user", "image": "image", "animated": "motion", "clip": "video", "sound": "wave-sine", "music": "music"}[kind]
        c.icon(ic, x + 4, y + 5, 8, tint)
        maxc = max(4, int((w - 18) / 4.6))
        lab = label if len(label) <= maxc else label[: max(2, maxc // 2 - 1)] + "…" + label[-(maxc // 2 - 1) :]
        c.text(x + 15, y + 12, lab, 7, t["fg"])
        by = y + 16
        bh = h - 20
        c.rect(x + 2, by, w - 4, bh, mix(t["elcard"], tint, 0.06), rx=2)
        if art:
            cid = c.cls("tc")
            c.defs.append(f'<clipPath id="{cid}"><rect x="{x + 2}" y="{by}" width="{w - 4}" height="{bh}" rx="2"/></clipPath>')
            c.raw(f'<g clip-path="url(#{cid})"><g transform="translate({x + 2},{by}) scale({bh / vh:.3f})"><g transform="translate({-vx},{-vy})">{art}</g></g></g>')
        if wave_seed is not None:
            c.waveform(x + 6, by + 2, w - 12, bh - 4, tint, seed=wave_seed, opacity=0.9)
        if scene:
            c.rect(x + 2, y + h - 12, 34, 10, t["onmedia"], rx=2, opacity=0.65)
            c.text(x + 19, y + h - 4.5, f"Scene {scene}", 6.5, "#ffffff", anchor="middle", weight=500)

    clip("film", 0, 4, "image", "Inside a sunlit kitchen", 1, arts[0])
    clip("film", 4, 7, "animated", "Red skips down a winding path", 2, arts[1])
    clip("film", 7, 10, "clip", "A wolf steps out from an oak", 3, arts[2])
    clip("film", 10, 12, "image", "Granny's cottage", 4, arts[3])
    clip("voice", 0, 3.6, "narration", "Once upon a time…", wave_seed=2)
    clip("voice", 4, 6.6, "narration", "The forest was full", wave_seed=4)
    clip("voice", 7, 9.6, "character", "Wolf: Good morning", wave_seed=6)
    clip("voice", 10, 12, "narration", "Granny's cottage", wave_seed=8)
    clip("wave-sine", 4.3, 6.2, "sound", "birds chirping", wave_seed=9)
    clip("wave-sine", 7.2, 8.2, "sound", "twig snap", wave_seed=11)
    clip("music", 0, 12, "music", "Gentle, playful orchestral music with flutes and strings", wave_seed=5)
    # playhead
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
    # scrim + dialog
    c.rect(0, 0, W, H, "#000000", opacity=0.35)
    DX, DY, DW, DH = 60, 16, 520, 328
    c.shadow(DX, DY, DW, DH, 8, 1.2)
    c.rect(DX, DY, DW, DH, t["recessed"], rx=8, stroke=t["border"])
    c.text(DX + 14, DY + 20, "Settings", 11, t["fg"], weight=600)
    c.icon("x", DX + DW - 24, DY + 10, 12, t["muted"])
    # nav
    c.text(DX + 20, DY + 46, "Account", 10, t["fg"], weight=600)
    c.rect(DX + 14, DY + 54, 110, 20, t["card"], rx=5)
    c.icon("link", DX + 20, DY + 58, 11, t["fg"])
    c.text(DX + 36, DY + 68, "Models", 10, t["fg"], weight=500)
    # right pane
    RX, RY, RW, RH = DX + 136, DY + 32, DW - 148, DH - 44
    c.rect(RX, RY, RW, RH, t["card"], rx=10)
    c.text(RX + 14, RY + 20, "Models", 11, t["fg"], weight=600)
    c.text(RX + 14, RY + 42, "Providers", 10, t["muted"], weight=600)
    c.button(RX + RW - 14 - 84, RY + 30, "Add providers", icon="plus", size=9, h=20, pad=8)

    def tile(y, h, provider, name, status, right=None, cls=""):
        c.rect(RX + 14, y, RW - 28, h, t["elcard"], rx=8, stroke=t["border"], cls=cls)
        c.provider_mark(provider, RX + 24, y + 9, 16, cls=cls)
        c.text(RX + 46, y + 21, name, 10, t["fg"], weight=500, cls=cls)
        nx = RX + 46 + tw(name, 10) + 8
        if status == "valid":
            c.badge(nx, y + 9.5, "Connected", "default", icon="check-circle", cls=cls)
        elif status == "unverified":
            c.badge(nx, y + 9.5, "Unverified", "caution", icon="hour-glass", cls=cls)
        if right:
            c.text(RX + RW - 24, y + 21, right, 8.5, t["muted"], anchor="end", cls=cls)
        return nx

    y = RY + 54
    tile(y, 34, "openslop", "OpenSlop", "valid", "Included with your account")
    tile(y + 40, 34, "anthropic", "Anthropic", "valid", "••••k3Qp · added Sep 3")
    # Cartesia: the key form, then the connected tile
    cy = y + 80
    form = c.span(0, 7.4, fade=0.15)
    c.rect(RX + 14, cy, RW - 28, 96, t["elcard"], rx=8, stroke=t["border"], cls=form)
    c.rect(RX + 14, cy, RW - 28, 96, "none", rx=8, stroke=t["accent"], cls=c.span(0, 0.6, fade=0.4))
    c.provider_mark("cartesia", RX + 24, cy + 9, 16, cls=form)
    c.text(RX + 46, cy + 21, "Cartesia", 10, t["fg"], weight=500, cls=form)
    nx = RX + 46 + tw("Cartesia", 10) + 8
    c.badge(nx, cy + 9.5, "Unverified", "caution", icon="hour-glass", cls=c.span(4.0, 7.4, fade=0.1))
    c.text(RX + 24, cy + 42, "Cartesia API key", 9, t["fg"], cls=form)
    c.rect(RX + 24, cy + 48, RW - 48, 20, t["elinput"], rx=5, stroke=t["border"], cls=form)
    c.rect(RX + 24, cy + 48, RW - 48, 20, "none", rx=5, stroke=t["accent"], sw=1.5, cls=c.span(1.0, 3.6, fade=0.1))
    c.text(RX + 31, cy + 61.5, "Paste in your API key here", 9, t["muted"], cls=c.span(0, 1.4, fade=0.05))
    c.typewriter(RX + 31, cy + 61.5, "•" * 34, 1.4, 3.0, 9, t["fg"], cls=form)
    # buttons: Save and validate · Cancel · Get a key
    sv = c.span(0, 7.4, fade=0.1)
    c.button(RX + 24, cy + 72, "Save and validate", icon="key", variant="primary", size=8.5, h=18, pad=7, cls=sv)
    c.rect(RX + 22, cy + 70, 118, 22, "none", rx=7, stroke=t["accent"], sw=1.5, cls=c.span(3.5, 3.9, fade=0.08))
    c.text(RX + 150, cy + 84, "Cancel", 8.5, t["muted"], cls=form)
    c.text(RX + RW - 24 - 10, cy + 84, "Get a key", 8.5, t["fg"], anchor="end", weight=600, cls=form, extra='text-decoration="underline"')
    c.icon("arrow-up-right", RX + RW - 32, cy + 76, 9, t["fg"], cls=form)
    # validating: spinner in the badge slot
    val = c.span(3.9, 4.0, fade=0.05)
    # connected tile replaces the form
    con = c.appear(7.5, dy=0)
    nx2 = tile(cy, 34, "cartesia", "Cartesia", "valid", "••••x9Lm · added just now", cls=con)
    # buttons under the connected tile: Test · Replace key · Delete key
    c.rect(RX + 14, cy + 34, RW - 28, 30, t["elcard"], rx=8, cls=con)
    c.rect(RX + 14, cy, RW - 28, 64, "none", rx=8, stroke=t["border"], cls=con)
    c.rect(RX + 15, cy + 28, RW - 30, 10, t["elcard"], cls=con)
    bx = RX + 24
    bx += c.button(bx, cy + 38, "Test", icon="refresh-cw", size=8.5, h=18, pad=7, cls=con) + 6
    bx += c.button(bx, cy + 38, "Replace key", icon="pencil", size=8.5, h=18, pad=7, cls=con) + 6
    c.button(RX + RW - 24 - 64, cy + 38, "Delete key", icon="trash", variant="destructive", size=8.5, h=18, pad=7, cls=con)
    # ElevenLabs: not connected yet; it and the defaults move up once the form collapses
    ey = cy + 104
    up = c.shift(7.5, dy=-32, dur=0.3)
    c.raw(f'<g class="{up}">')
    c.rect(RX + 14, ey, RW - 28, 34, t["elcard"], rx=8, stroke=t["border"])
    c.provider_mark("elevenlabs", RX + 24, ey + 9, 16)
    c.text(RX + 46, ey + 21, "ElevenLabs", 10, t["fg"], weight=500)
    c.text(RX + 46 + tw("ElevenLabs", 10) + 8, ey + 21, "Sound effects and music generation from a text prompt.", 8.5, t["muted"])
    c.button(RX + RW - 24 - 58, ey + 7, "Connect", icon="link", size=8.5, h=20, pad=7)
    # account defaults peek
    dy2 = ey + 52
    c.raw(f'<line x1="{RX + 14}" y1="{dy2 - 10}" x2="{RX + RW - 14}" y2="{dy2 - 10}" stroke="{t["border"]}"/>')
    c.text(RX + 14, dy2 + 4, "Account defaults", 10, t["muted"], weight=600)
    c.text(RX + RW - 14, dy2 + 4, "Reset to recommended", 8.5, t["muted"], anchor="end")
    c.raw("</g>")
    # the pane clips what scrolls past its bottom edge
    c.rect(RX, RY + RH, RW, 40, t["recessed"])
    c.rect(DX, DY + DH, DW, 20, t["bg"])
    c.write()


def main():
    for theme in ("dark", "light"):
        for fn in (card_describe, card_sloppy, card_canvas, card_generate, card_timeline, card_providers):
            fn(theme)


if __name__ == "__main__":
    main()
