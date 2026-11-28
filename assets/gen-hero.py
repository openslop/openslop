#!/usr/bin/env python3
"""Emits assets/openslop-hero-dark.svg, the README hero: four ideas, each typed into the composer,
worked through by Sloppy, built on the canvas and played on the timeline. Plain SVG and CSS keyframes,
so it plays on GitHub. Helpers come from gen-features.py; assets/hero-src holds real generations.

Needs fonttools and brotli. Run from anywhere: python3 assets/gen-hero.py
"""
import base64
import functools
import html
import importlib.util
import io
import pathlib
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "hero-src"
sys.dont_write_bytecode = True
_spec = importlib.util.spec_from_file_location("features", ROOT / "assets" / "gen-features.py")
F = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(F)

VW, VH = 1280, 720
BASE = 2  # world units are the feature cards' half-size app pixels
INTER = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif"
SLOP = "Slopella, Inter, -apple-system, 'Segoe UI', sans-serif"
SERIF = "'Instrument Serif', Georgia, serif"
F.SANS = SLOP

FONT_FILES = {
    "Inter": ROOT / "public" / "fonts" / "InterVariable.woff2",
    "Slopella": ROOT / "public" / "fonts" / "Slopella.woff2",
    "Instrument Serif": SRC / "instrument-serif.woff2",
}
FAMILY_OF = {INTER: "Inter", SLOP: "Slopella", SERIF: "Instrument Serif"}


@functools.cache
def _instance(name, weight):
    font = TTFont(FONT_FILES[name])
    if "fvar" in font:
        axes = {a.axisTag: a.defaultValue for a in font["fvar"].axes}
        axes["wght"] = weight
        font = instancer.instantiateVariableFont(font, axes)
    metrics, upm = font["hmtx"].metrics, font["head"].unitsPerEm
    return {chr(c): metrics[g][0] / upm for c, g in font.getBestCmap().items() if g in metrics}


def tw(s, size, weight=400, family=None):
    widths = _instance(FAMILY_OF.get(family, "Slopella"), weight)
    return sum(widths.get(ch, 0.55) for ch in s) * size


F.tw = tw


def font_face(name):
    font = TTFont(FONT_FILES[name], lazy=False)
    opts = subset.Options()
    opts.layout_features = ["kern", "liga", "calt", "tnum"]
    sub = subset.Subsetter(opts)
    sub.populate(text="".join(chr(c) for c in range(32, 127)) + "…·–—“”‘’•")
    sub.subset(font)
    if "fvar" in font:
        pinned = {a.axisTag: a.defaultValue for a in font["fvar"].axes if a.axisTag != "wght"}
        if pinned:
            font = instancer.instantiateVariableFont(font, pinned)
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    data = base64.b64encode(buf.getvalue()).decode()
    weight = "100 900" if name != "Instrument Serif" else "400"
    return f"@font-face{{font-family:'{name}';src:url(data:font/woff2;base64,{data}) format('woff2');font-weight:{weight}}}"


def jpeg(path, width, quality=80):
    from PIL import Image

    img = Image.open(path).convert("RGB")
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(out.getvalue()).decode(), img.size


def wrap(s, width, size, family=INTER, weight=400):
    lines, line = [], ""
    for word in s.split(" "):
        cand = f"{line} {word}".strip()
        if line and tw(cand, size, weight, family) > width:
            lines.append(line)
            line = word
        else:
            line = cand
    return lines + [line]


class Hero(F.Card):
    def __init__(self, loop):
        super().__init__("hero", "OpenSlop", "", loop, "dark")
        self.sizes = {}
        self.title = "OpenSlop, the free open-source AI video creator"
        self.desc = (
            "Four ideas typed into the OpenSlop composer, an anime episode, a product launch with the user's own avatars, "
            "a live-action thriller and a documentary. For each, Sloppy, the copilot, thinks, replies, and builds a storyboard "
            "of image, video, speech, music and sound elements on the canvas."
        )

    # ---- timing helpers on absolute loop seconds
    def pct(self, t):
        return f"{max(0.0, min(t, self.loop)) / self.loop * 100:.3f}%"

    def window(self, t0, t1, fade=0.12):
        """Visible from t0 to t1, fading over `fade` either side."""
        c = self.cls("w")
        frames = []
        if t0 > 0:
            frames += [f"0%,{self.pct(t0 - fade)}{{opacity:0}}"]
        frames += [f"{self.pct(t0)},{self.pct(t1)}{{opacity:1}}"]
        if t1 + fade < self.loop:
            frames += [f"{self.pct(t1 + fade)},100%{{opacity:0}}"]
        self.css.append(f".{c}{{animation:kf-{c} {self.loop}s linear infinite both}}@keyframes kf-{c}{{{''.join(frames)}}}")
        return c

    def rise(self, t, dy=8, dur=0.35, blur=4):
        """Fades in while rising and sharpening, like fadeInUp."""
        return self.keys(
            [
                (t - 0.001, f"opacity:0;transform:translate(0,{dy}px);filter:blur({blur}px)"),
                (t + dur, "opacity:1;transform:translate(0,0);filter:blur(0px)"),
                (t + dur + 0.01, "opacity:1;transform:none;filter:none"),
            ],
            ease="cubic-bezier(.2,.8,.2,1)",
        )

    def reveal(self, t, dur=0.5):
        """A generated render resolving: blurred and bright, then sharp."""
        return self.keys(
            [
                (t - 0.001, "opacity:0;filter:blur(10px) brightness(1.6)"),
                (t + dur * 0.35, "opacity:1;filter:blur(6px) brightness(1.3)"),
                (t + dur, "opacity:1;filter:blur(0px) brightness(1)"),
                (t + dur + 0.01, "opacity:1;filter:none"),
            ],
            ease="cubic-bezier(.3,.7,.2,1)",
        )

    def type_line(self, x, y, s, t0, t1, size, fill, family=INTER, weight=400, caret_until=None):
        """Types `s` one character at a time, with a caret riding the end of the text."""
        n = len(s)
        cw = [tw(s[:i], size, weight, family) for i in range(n + 1)]
        full = cw[-1] + 2
        cid = self.cls("ty")
        steps = "".join(f"{self.pct(t0 + (t1 - t0) * i / n)}{{transform:scaleX({max(cw[i], 0.01) / full:.4f})}}" for i in range(n + 1))
        self.css.append(
            f".{cid}{{animation:kf-{cid} {self.loop}s step-end infinite both;transform-box:fill-box;transform-origin:left center}}"
            f"@keyframes kf-{cid}{{0%{{transform:scaleX(0.0001)}}{steps}100%{{transform:scaleX(1)}}}}"
        )
        self.defs.append(f'<clipPath id="{cid}"><rect class="{cid}" x="{x - 0.5}" y="{y - size * 1.1}" width="{full + 1}" height="{size * 1.6}"/></clipPath>')
        self.raw(f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{fill}" style="white-space:pre" clip-path="url(#{cid})">{html.escape(s)}</text>')
        if caret_until is None:
            return
        kid = self.cls("cr")
        steps = "".join(f"{self.pct(t0 + (t1 - t0) * i / n)}{{transform:translate({cw[i]:.2f}px,0)}}" for i in range(n + 1))
        self.css.append(f".{kid}{{animation:kf-{kid} {self.loop}s step-end infinite both}}@keyframes kf-{kid}{{0%{{transform:translate(0,0)}}{steps}100%{{transform:translate({cw[-1]:.2f}px,0)}}}}")
        vis = self.window(t0, caret_until, fade=0.01)
        bl = self.cls("bk")
        self.css.append(f".{bl}{{animation:kf-{bl} 1s step-end infinite}}@keyframes kf-{bl}{{0%,50%{{opacity:1}}60%,100%{{opacity:0}}}}")
        self.raw(f'<g class="{vis}"><g class="{kid}"><rect class="{bl}" x="{x + 0.6}" y="{y - size * 0.86}" width="1.1" height="{size * 1.08}" rx="0.5" fill="{self.t["fg"]}"/></g></g>')

    # ---- surfaces
    def grain(self, x, y, w, h, rx=12, cls="", opacity=0.26):
        """The app's .grain over a raised surface."""
        self.raw(self.wrap(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="url(#{self.grain_texture()})" opacity="{opacity}"/>', cls))

    def photo(self, key, x, y, w, h, rx=6, cls="", width=400):
        uid = "ph-" + key.replace("/", "-")
        if uid not in self.sizes:
            href, self.sizes[uid] = jpeg(SRC / f"{key}.jpg", width)
            iw, ih = self.sizes[uid]
            self.defs.append(f'<image id="{uid}" width="{iw}" height="{ih}" preserveAspectRatio="none" href="{href}"/>')
        iw, ih = self.sizes[uid]
        sc = max(w / iw, h / ih)
        ox, oy = x + (w - iw * sc) / 2, y + (h - ih * sc) / 2
        cid = self.cls("pc")
        self.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/></clipPath>')
        self.raw(self.wrap(f'<g clip-path="url(#{cid})"><use href="#{uid}" transform="translate({ox:.2f},{oy:.2f}) scale({sc:.5f})"/></g>', cls))

    def shimmer(self, x, y, w, h, rx=6, cls=""):
        """A skeleton with the app's shimmer sweeping across it."""
        t = self.t
        if "shim" not in self._images:
            self._images.add("shim")
            self.defs.append(
                f'<linearGradient id="shimg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{t["fg"]}" stop-opacity="0"/>'
                f'<stop offset=".5" stop-color="{t["fg"]}" stop-opacity=".07"/><stop offset="1" stop-color="{t["fg"]}" stop-opacity="0"/></linearGradient>'
            )
            self.css.append(".shim{animation:kf-shim 1.1s linear infinite}@keyframes kf-shim{from{transform:translate(-100%,0)}to{transform:translate(100%,0)}}")
        cid = self.cls("sc")
        self.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/></clipPath>')
        self.raw(
            self.wrap(
                f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{t["secondary"]}"/>'
                f'<g clip-path="url(#{cid})"><g class="shim" style="transform-box:fill-box"><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#shimg)"/></g></g>'
                f'<rect x="{x + 0.5}" y="{y + 0.5}" width="{w - 1}" height="{h - 1}" rx="{rx}" fill="none" stroke="{t["border"]}"/>',
                cls,
            )
        )

    def write(self, body_open, body_close):
        faces = "".join(font_face(n) for n in FONT_FILES)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {VW} {VH}" width="{VW}" height="{VH}" role="img" aria-label="{html.escape(self.title)}">\n'
            f"<title>{html.escape(self.title)}</title>\n<desc>{html.escape(self.desc)}</desc>\n"
            "<style>\n" + faces + "\ntext{font-kerning:normal;text-rendering:geometricPrecision}\n" + "\n".join(self.css) + "\n</style>\n<defs>\n" + "\n".join(self.defs) + "\n</defs>\n"
            + body_open + "\n" + "\n".join(self.body) + "\n" + body_close + "\n</svg>\n"
        )
        p = ROOT / "assets" / "openslop-hero-dark.svg"
        p.write_text(svg)
        print(f"{p.name}  {len(svg):,} bytes")


# =====================================================================================
# The four ideas
# =====================================================================================
IMAGE = ("Seedream 5 Lite", "runware")
VIDEO = ("Kling 3 Omni", "kling")
SPEECH = ("Sonic 3.6", "cartesia")
MUSIC = ("Eleven Music v1", "elevenlabs")
SOUND = ("Eleven Text to Sound v2", "elevenlabs")
KIND_LABEL = {"image": "Image", "video": "Video", "speech": "Speech", "music": "Music", "sound": "Sound"}
KIND_MODEL = {"image": IMAGE, "video": VIDEO, "speech": SPEECH, "music": MUSIC, "sound": SOUND}

IDEAS = [
    dict(
        prompt="An anime episode about drifting",
        title="Midnight Drift",
        thought="The user wants an anime episode about drifting. Two rivals, a mountain pass at night, eurobeat. Open on the street, then the drift itself.",
        skill="write-script",
        scene="0:00 – 0:14",
        dur="14s",
        assets=[("Art style", "magic", None), ("Takeshi", None, "drift-takeshi"), ("Ryu", None, "drift-ryu"), ("Narrator", "voice", None)],
        cards=[
            ("image", "Rain-slick Tokyo street at 2am, neon signs bleeding into the puddles.", "drift-street"),
            ("video", "Takeshi's car swings wide and drifts through the hairpin, smoke pouring off.", ("frames", "drift-smoke", 3, 0.45)),
            ("speech", "Ryu: You call that a drift? Watch my line.", None),
            ("music", "Eurobeat, 155 bpm, screaming synth lead.", None),
            ("sound", "Tyres screeching, engine bouncing off the limiter.", None),
        ],
        reply="on it boss! two rivals, one mountain pass, eurobeat the whole way down.",
        elements=18,
    ),
    dict(
        prompt="A product launch video for my app",
        attach=["launch-founder", "launch-mascot"],
        title="Launch Day",
        thought="A launch video starring the user and their mascot from the two pictures. Keep it short and punchy, phone close-ups, then a big reveal.",
        skill="write-script",
        scene="0:00 – 0:12",
        dur="12s",
        assets=[("Art style", "magic", None), ("You", None, "launch-founder"), ("Fluff", None, "launch-mascot"), ("Narrator", "voice", None)],
        cards=[
            ("speech", "You: Meet the app that runs your whole week.", None),
            ("image", "Fluff and a plush friend float over the big orange button.", "launch-float"),
            ("video", "Fluff materializes beside you at the laptop in a burst of light.", ("frames", "launch-laptop", 12, 0.2)),
            ("image", "You at your desk, grinning, as Fluff pops out of a box.", "launch-box"),
            ("music", "Upbeat indie pop with a big drop at the reveal.", None),
        ],
        reply="love it boss. you and fluff star in a 30s launch: the loft, the laptop, then a big drop on the reveal.",
        elements=21,
    ),
    dict(
        prompt="A live-action yakuza thriller set in neon Tokyo, 10 minutes",
        title="Neon Oath",
        thought="Ten minutes of live-action yakuza noir. Rain, neon, a torii gate. Kenji is the lead; open on the rooftop and build to the tatami scene.",
        skill="video-prompts",
        scene="0:00 – 0:18",
        dur="18s",
        assets=[("Art style", "magic", None), ("Kenji", None, "noir-tattoo"), ("Narrator", "voice", None)],
        cards=[
            ("image", "Kenji on a rain-soaked rooftop above Shinjuku, collar up.", "noir-rooftop"),
            ("video", "Slow push past the torii gate as his men close in.", ("kb", "noir-torii")),
            ("speech", "Kenji: The family forgives once. Never twice.", None),
            ("sound", "Heavy rain on neon signs, sirens far below.", None),
            ("video", "Two men kneel on tatami, a blade between them.", ("kb", "noir-tatami")),
        ],
        reply="neon oath, ten minutes in 24 scenes. kenji gets the rooftop opener.",
        elements=96,
    ),
    dict(
        prompt="A Vox-style documentary about the global chip war",
        title="The Chip War",
        thought="A Vox-style explainer. Maps carry it: supply routes, the one island, then the 75% figure. Narration sets the stakes early.",
        skill="video-formats",
        scene="0:00 – 0:16",
        dur="16s",
        assets=[("Art style", "magic", None), ("Narrator", "voice", None)],
        cards=[
            ("speech", "Almost every phone on Earth depends on one small island.", None),
            ("image", "Animated world map, chip shipping routes lighting up.", "chip-routes"),
            ("image", "China lit red on a 3D map as arrows converge on it.", "chip-china"),
            ("video", "A dark world map as the supply lines light up one by one.", ("frames", "chip-map", 10, 0.32)),
            ("music", "Tense documentary pulse with a ticking clock.", None),
        ],
        reply="the chip war in 7 scenes. maps first, then the 75% reveal.",
        elements=30,
    ),
]

# ---- world layout (world units; the camera scales them by BASE * zoom)
CB = dict(x=120, y=100, w=400, h=112)  # composer box
EX = 760  # editor origin
STAGE = dict(x=EX + 222, y=34, w=410, h=524)
TLY = STAGE["y"] + STAGE["h"] + 10  # the transport and timeline under the canvas
PX, PW = EX + 50, 162  # the Sloppy panel
CARD_X, CARD_W = STAGE["x"] + 16, 238
COL_X, COL_W = CARD_X + CARD_W + 12, STAGE["x"] + STAGE["w"] - 16 - (CARD_X + CARD_W + 12)
CARD_Y0, CARD_H, CARD_GAP = STAGE["y"] + 122, 66, 8

# ---- timing (seconds, relative to each idea)
CHAR = 0.03
ARRIVE = 0.4  # whip into the composer ends
TYPE0 = 0.55
SLOPPY = 7.0  # following Sloppy's turn
PAN = 0.6  # Sloppy over to the canvas
CANVAS = 3.8  # the storyboard building
TIMELINE = 1.4  # a brief look at the timeline, playhead sweeping
EDIT = SLOPPY + PAN + CANVAS + TIMELINE
ATTACH = 0.45  # attachments drop in before typing
WHIP = 0.4


def plan():
    out, t = [], 0.0
    for idea in IDEAS:
        lines = wrap(idea["prompt"], CB["w"] - 40, 13)
        n = sum(len(s) for s in lines)
        lead = TYPE0 + (ATTACH if idea.get("attach") else 0)
        type_end = lead + n * CHAR
        send = type_end + 0.25
        land = send + 0.15 + WHIP
        end = land + EDIT
        out.append(dict(idea=idea, lines=lines, t=t, type0=t + lead, type_end=t + type_end, send=t + send, land=t + land, end=t + end))
        t += end + WHIP
    return out, t


# =====================================================================================
# Drawing
# =====================================================================================
GREETINGS = ["What slop today, boss?", "Evening slop session, boss?", "3am slop hits different.", "Time to cook absolute slop, boss."]


def composer(c, timeline):
    t = c.t
    c.light_rays()
    # headline: <RobotFill /> + greeting in the serif hero size
    for k, greet in enumerate(GREETINGS[: len(timeline)]):
        t0 = timeline[k]["t"] if k else 0
        t1 = timeline[k + 1]["t"] if k + 1 < len(timeline) else c.loop
        gw = tw(greet, 34, 400, SERIF)
        gx = 320 - (gw + 40) / 2
        c.raw(f'<g class="{c.window(t0, t1, fade=0.05)}">')
        c.icon("robot-fill", gx, 47, 32, t["fg"])
        c.text(gx + 40, 72, greet, 34, t["fg"], family=SERIF, extra='letter-spacing="-0.4"')
        c.raw("</g>")

    x, y, w, h = CB["x"], CB["y"], CB["w"], CB["h"]
    # .ambient-glow: berry light around the composer, breathing
    c.defs.append('<filter id="glow" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>')
    c.css.append(".breathe{animation:kf-breathe 4s ease-in-out infinite alternate}@keyframes kf-breathe{from{opacity:.55}to{opacity:1}}")
    c.raw(f'<g class="breathe"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="none" stroke="#e4b5d4" stroke-opacity=".5" stroke-width="5" filter="url(#glow)"/></g>')
    c.shadow(x, y, w, h, 14, 0.8)
    c.rect(x, y, w, h, t["card"], rx=14, stroke=t["border2"])
    c.grain(x, y, w, h, 14)

    # control row
    ry = y + h - 30
    c.rect(x + 14, ry, 20, 20, "none", rx=10, stroke=t["border2"])
    c.icon("plus", x + 18, ry + 4, 12, t["muted"])
    px = x + 42
    for label, icon in (("16:9", "aspect-ratio"), ("Auto", "hour-glass")):
        px += c.pill(px, ry + 1, label, 9, t["secondary"], t["fg"], icon=icon, chevron=True, h=18, weight=450) + 5
    mw = 7 + 10 + 5 + tw("Claude Opus 5.5", 9, 450) + 6 + 8 + 6
    mx = px + 1
    c.rect(mx, ry + 1, mw, 18, t["secondary"], rx=5)
    c.provider_mark("anthropic", mx + 7, ry + 5, 10)
    c.text(mx + 22, ry + 13.3, "Claude Opus 5.5", 9, t["fg"], weight=450)
    c.icon("chevron-down", mx + mw - 14, ry + 6, 8, t["muted"])
    c.icon("lightbulb", mx + mw + 7, ry + 3, 14, t["muted"])
    sbx = x + w - 38
    c.rect(sbx, ry - 1, 22, 22, t["secondary"], rx=6)
    c.icon("corner-down-left", sbx + 4, ry + 3, 14, t["accent"], opacity=0.35)

    c.button(320 - c.button_w("Skip to a blank canvas", size=9, pad=10) / 2, y + h + 12, "Skip to a blank canvas", variant="panel", size=9, h=22)

    # "Need inspiration?" with two real templates
    gy = 268
    c.text(x, gy, "Need inspiration?", 9.5, t["muted"], weight=450)
    for i, (title, desc, name, col, img) in enumerate(
        [
            ("POV Your Life as A...", "Second-person POV voiceover with…", "POV Life", "#F59E0B", "template-pov-life.jpg"),
            ("Get Sleepy with...", "Slow, soothing narration to lull…", "Sleep Story", "#6366F1", "template-sleep-story.jpg"),
        ]
    ):
        tx, ty = x + i * 206, gy + 8
        c.rect(tx, ty, 194, 56, t["card"], rx=10, stroke=t["border"])
        c.defs.append(f'<clipPath id="tplc{i}"><path d="M{tx + 10} {ty}h34v56h-34a10 10 0 0 1 -10 -10v-36a10 10 0 0 1 10 -10z"/></clipPath>')
        c.file_image(img, tx, ty, 44, 56, clip=f"tplc{i}")
        c.text(tx + 54, ty + 17, title, 10, t["fg"], weight=600)
        c.text(tx + 54, ty + 31, desc, 8, t["muted"], family=INTER)
        c.icon("chevron-right", tx + 178, ty + 8, 10, t["muted"])
        c.pill(tx + 54, ty + 38, name, 7.5, col, "#ffffff", h=12, pad=5, weight=500)

    # each idea: placeholder until typing, the typed prompt, the send press
    tx0 = x + 18
    for p in timeline:
        start, type0 = p["t"], p["type0"]
        attach = p["idea"].get("attach")
        ty0 = y + (58 if attach else 32)
        c.raw(f'<g class="{c.window(max(0.0, start - 0.2), type0 - 0.02, fade=0.02)}">')
        c.text(tx0, ty0, "Describe your slop or paste a script", 13, t["muted"], family=INTER)
        c.raw("</g>")
        if attach:
            # the AssetStrip: dropped-in pictures above the prompt, each with its remove badge
            c.raw(f'<g class="{c.window(max(0.0, start - 0.2), p["land"], fade=0.05)}">')
            for i, key in enumerate(attach):
                ax, ay = tx0 + i * 34, y + 12
                a = c.keys(
                    [(start + 0.1 + i * 0.12 - 0.001, "opacity:0;transform:translate(0,-10px) scale(.7)"), (start + 0.42 + i * 0.12, "opacity:1;transform:translate(0,0) scale(1)")],
                    ease="cubic-bezier(.3,1.5,.5,1)",
                    origin="center",
                )
                c.raw(f'<g class="{a}">')
                c.photo(key, ax, ay, 28, 28, rx=6, width=96)
                c.rect(ax + 0.5, ay + 0.5, 27, 27, "none", rx=6, stroke=t["border2"])
                c.raw(f'<circle cx="{ax + 26}" cy="{ay + 2}" r="5" fill="{t["secondary"]}" stroke="{t["border2"]}"/>')
                c.icon("x", ax + 23, ay - 1, 6, t["muted"])
                c.raw("</g>")
            c.raw("</g>")
        c.raw(f'<g class="{c.window(type0 - 0.01, p["land"], fade=0.05)}">')
        tt = type0
        for i, line in enumerate(p["lines"]):
            t1 = tt + len(line) * CHAR
            last = i == len(p["lines"]) - 1
            c.type_line(tx0, ty0 + i * 20, line, tt, t1, 13, t["fg"], caret_until=(p["send"] + 0.1) if last else t1 - 0.01)
            tt = t1
        c.raw("</g>")
        # send: the icon lights up with text, then the button fills accent on Enter
        c.raw(f'<g class="{c.window(type0 + 0.05, p["send"], fade=0.05)}">')
        c.icon("corner-down-left", sbx + 4, ry + 3, 14, t["accent"])
        c.raw("</g>")
        press = c.window(p["send"], p["land"], fade=0.04)
        pop = c.keys([(p["send"], "transform:scale(.86)"), (p["send"] + 0.18, "transform:scale(1)")], ease="cubic-bezier(.3,1.6,.5,1)", origin="center")
        c.raw(f'<g class="{press}"><g class="{pop}"><rect x="{sbx}" y="{ry - 1}" width="22" height="22" rx="6" fill="{t["accent"]}"/>')
        c.icon("corner-down-left", sbx + 4, ry + 3, 14, t["accentfg"])
        c.raw("</g></g>")
        c.click(p["send"], sbx + 11, ry + 10)


def editor_chrome(c):
    t = c.t
    # top bar
    c.raw(f'<line x1="{EX}" y1="26.5" x2="{EX + 640}" y2="26.5" stroke="{t["border"]}"/>')
    c.defs.append('<linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5aa64"/><stop offset="1" stop-color="#be4a1d"/></linearGradient>')
    c.raw(f'<circle cx="{EX + 20}" cy="13" r="7.5" fill="url(#avatar)"/>')
    ew = c.button_w("Export", size=8.5, pad=8)
    c.button(EX + 632 - ew, 5, "Export", variant="panel", size=8.5, h=17, pad=8)
    # rail
    c.raw(f'<line x1="{EX + 40.5}" y1="27" x2="{EX + 40.5}" y2="720" stroke="{t["border"]}"/>')
    # the Rail at half scale: 72px wide, items py-2.5 with a 16px icon over a text-label-xs label (gap-1),
    # separators my-1 between groups, Sloppy pinned at the foot and selected (bg-secondary, rounded-xl)
    def item(y0, icon, label, selected=False):
        col = t["panellabel"] if selected else t["muted"]
        if selected:
            c.rect(EX + 4, y0, 32, 28, t["secondary"], rx=6)
        c.icon(icon, EX + 16, y0 + 5, 8, col)
        c.text(EX + 20, y0 + 21, label, 5.5, col, anchor="middle", weight=600 if selected else 500)

    def separator(y):
        c.raw(f'<line x1="{EX + 10}" y1="{y:.1f}" x2="{EX + 30}" y2="{y:.1f}" stroke="{t["border"]}" stroke-width=".5"/>')

    groups = [[("folder-open", "Assets"), ("stock-alt", "Media"), ("text-box", "Captions")], [("layout", "Layout"), ("sliders-alt", "Properties"), ("magic", "Effects")], [("insert-element", "Models")], [("history", "History"), ("info", "Project")]]
    yy = 35
    item(yy, "home", "Home")
    yy += 30
    for group in groups:
        separator(yy + 2)
        yy += 6.5
        for ic, lab in group:
            item(yy, ic, lab)
            yy += 30
    separator(680)
    item(684, "robot-fill", "Sloppy", selected=True)
    # Sloppy panel header and its composer
    c.icon("robot-fill", PX, 35, 13, t["panellabel"])
    c.text(PX + 18, 46, "Sloppy", 11.5, t["panellabel"], weight=600)
    cy = 648
    c.shadow(PX, cy, PW, 42, 10, 0.5)
    c.rect(PX, cy, PW, 42, t["elcard"], rx=10, stroke=t["border"])
    c.grain(PX, cy, PW, 42, 10)
    c.text(PX + 9, cy + 14, "Write or change the script…", 8, t["muted"], family=INTER)
    c.provider_mark("anthropic", PX + 9, cy + 23, 9)
    c.text(PX + 22, cy + 30.5, "Claude Opus 5.5", 7.5, t["muted"], weight=450)
    c.rect(PX + 140, cy + 21, 16, 16, t["secondary"], rx=5)
    c.icon("corner-down-left", PX + 142.5, cy + 23.5, 11, t["accent"], opacity=0.4)
    # the canvas card
    s = STAGE
    c.shadow(s["x"], s["y"], s["w"], s["h"], 14, 1.0)
    c.rect(s["x"], s["y"], s["w"], s["h"], t["elcard"], rx=14, stroke=t["border"])
    c.grain(s["x"], s["y"], s["w"], s["h"], 14)
    # the timeline's fixed chrome under the canvas
    c.raw(f'<line x1="{s["x"] - 8}" y1="{TLY - 4.5}" x2="{EX + 640}" y2="{TLY - 4.5}" stroke="{t["border"]}"/>')


SHIM = 'mask="url(#shim)"'


def shimmer_text_def(c):
    """.shimmer: text at 30-60% of its color with a brighter band sweeping across every 2s.
    One shared mask: a repeating gradient band the CSS slides along, so every shimmering label moves together."""
    if "shim-mask" in c._images:
        return
    c._images.add("shim-mask")
    c.defs.append(
        '<linearGradient id="shimband" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="0" spreadMethod="repeat">'
        '<stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient>'
        '<mask id="shim" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><rect class="shimsweep" x="-2000" y="-2000" width="6000" height="6000" fill="url(#shimband)"/></mask>'
    )
    c.css.append(".shimsweep{animation:kf-shimsweep 2s linear infinite}@keyframes kf-shimsweep{from{transform:translate(0,0)}to{transform:translate(120px,0)}}")


def sloppy_turn(c, p):
    """One turn in the Sloppy panel as the app renders it: the user's message, reasoning that streams
    open then shuts, tool calls with their one-line outcomes, the orb status, the reply card, Worked for."""
    t, idea, land = c.t, p["idea"], p["land"]
    shimmer_text_def(c)
    scroll = []

    # UserMessage: rounded-xl rounded-br-sm, bg-user-message
    lines = wrap(idea["prompt"], PW * 0.88 - 22, 8.5)
    bw = max(tw(s, 8.5, 400, INTER) for s in lines) + 20
    bh = 11 + 12 * len(lines)
    bx, by = PX + PW - bw, 58
    c.raw(f'<path d="M{bx + 9} {by}h{bw - 18}a9 9 0 0 1 9 9v{bh - 11}a2 2 0 0 1 -2 2h{-(bw - 11)}a9 9 0 0 1 -9 -9v{-(bh - 9 - 9)}a9 9 0 0 1 9 -9z" fill="{t["primary"]}"/>')
    for i, s in enumerate(lines):
        c.text(bx + 10, by + 14 + i * 12, s, 8.5, t["primaryfg"], family=INTER)
    y = by + bh + 16

    # Reasoning: open while it streams, then "Done thinking" and shut
    r0, r1 = land + 0.25, land + 1.9
    c.raw(f'<g class="{c.window(land - 0.4, r1, fade=0.02)}">')
    c.icon("chevron-down", PX + 1, y - 7, 8, t["muted"])
    c.raw("</g>")
    c.raw(f'<g class="{c.window(r1 + 0.02, land + EDIT + 1, fade=0.02)}">')
    c.icon("chevron-right", PX + 1, y - 7, 8, t["muted"])
    c.raw("</g>")
    c.icon("magic", PX + 11, y - 7.5, 8, t["muted"])
    c.raw(f'<g class="{c.window(land - 0.4, r1, fade=0.03)}">')
    c.text(PX + 23, y, "Thinking…", 7.5, t["muted"], weight=475, extra=SHIM)
    c.raw("</g>")
    c.raw(f'<g class="{c.window(r1 + 0.03, land + EDIT + 1, fade=0.03)}">')
    c.text(PX + 23, y, "Done thinking", 7.5, t["muted"], weight=475)
    c.raw("</g>")
    box = c.keys(
        [(r0 - 0.001, "opacity:0;transform:scaleY(.6)"), (r0 + 0.2, "opacity:1;transform:scaleY(1)"), (r1, "opacity:1;transform:scaleY(1)"), (r1 + 0.18, "opacity:0;transform:scaleY(.2)")],
        ease="cubic-bezier(.3,.7,.2,1)",
        origin="top",
    )
    thought = wrap(idea["thought"], PW - 32, 7, SLOP)[:4]
    hgt = 10 + 10 * len(thought)
    c.raw(f'<g class="{box}">')
    c.rect(PX + 12, y + 6, PW - 12, hgt, t["recessed"], rx=5)
    for i, line in enumerate(thought):
        t0 = r0 + 0.15 + i * 0.36
        c.type_line(PX + 19, y + 18 + i * 10, line, t0, t0 + 0.34, 7, t["muted"], family=SLOP)
    c.raw("</g>")
    first_status = y + 6 + hgt + 16
    scroll.append((r0 + 0.6, 118))

    # tool calls, landing where the shut reasoning leaves room
    y += 20
    n = idea["elements"]
    rows = [
        ("book-open", f"Reading up on {idea['skill']}", f"# Skill: {idea['skill']}", False),
        ("eye", "Reading the script", "The script is empty.", False),
        ("sliders", "Naming the project", f"Named it {idea['title']}.", False),
        ("pencil", f"Editing the script ({n} changes)", f"Applied {n} operations. Inserted s1, s2, s3, s4.", True),
        ("hour-glass", "Fitting video elements to the speech", "Trimmed 2 visuals to their speech.", False),
    ]
    t_row = r1 + 0.2
    statuses = []
    for i, (icon, label, outcome, pending) in enumerate(rows):
        at = t_row + i * 0.72
        done = at + (0.62 if pending else 0.42)
        a = c.rise(at, dy=3, dur=0.22, blur=2)
        c.raw(f'<g class="{a}">')
        c.icon("chevron-right", PX + 1, y - 7, 8, t["muted"])
        c.icon(icon, PX + 11, y - 7.5, 8, t["muted"])
        c.raw(f'<g class="{c.window(at, done, fade=0.02)}">')
        c.text(PX + 23, y, label, 7.5, t["muted"], weight=475, extra=SHIM)
        c.raw(f'</g><g class="{c.window(done + 0.02, land + EDIT + 1, fade=0.02)}">')
        c.text(PX + 23, y, label, 7.5, t["muted"], weight=475)
        c.raw("</g>")
        c.raw("</g>")
        o = c.rise(done, dy=2, dur=0.2, blur=1.5)
        c.raw(f'<g class="{o}"><line x1="{PX + 5.5}" y1="{y + 4}" x2="{PX + 5.5}" y2="{y + 15}" stroke="{t["border"]}"/>')
        c.text(PX + 13, y + 12.5, outcome, 7, t["muted"], weight=475, extra='opacity=".7"')
        c.raw("</g>")
        statuses.append((at, "Applying changes" if pending else "Slopping…", y + 30))
        y += 27
        scroll.append((done, max(118, y - 40)))

    # the reply, on a grained PanelCard
    rt = t_row + len(rows) * 0.72 + 0.1
    rl = wrap(idea["reply"], PW - 24, 8.5)
    rh = 16 + 12 * len(rl)
    ry = y - 4
    rp = c.rise(rt, dy=6, dur=0.3, blur=3)
    c.raw(f'<g class="{rp}">')
    c.rect(PX, ry, PW, rh, t["elcard"], rx=10)
    c.grain(PX, ry, PW, rh, 10)
    c.raw("</g>")
    for i, line in enumerate(rl):
        t0 = rt + 0.1 + i * 0.22
        c.type_line(PX + 12, ry + 17 + i * 12, line, t0, t0 + 0.22, 8.5, t["fg"])
    end = rt + 0.1 + len(rl) * 0.22
    statuses.append((rt, "Responding", ry + rh + 16))
    worked = round(end - land + 6)
    wa = c.rise(end + 0.15, dy=2, dur=0.2, blur=1)
    c.raw(f'<g class="{wa}">')
    c.icon("magic", PX + 4, ry + rh + 8.5, 8, t["muted"])
    c.text(PX + 16, ry + rh + 16, f"Worked for {worked}s", 7.5, t["muted"], weight=475)
    c.raw("</g>")
    scroll.append((rt + 0.4, max(118, ry + rh - 30)))

    # WorkingStatus: the orb and a shimmering "<status> · Ns" under the newest step, ticking each second
    statuses = [(land - 0.4, "Slopping…", first_status)] + statuses
    for k, (at, label, sy) in enumerate(statuses):
        until = statuses[k + 1][0] if k + 1 < len(statuses) else end
        g = c.window(max(at, land - 0.4), until - 0.01, fade=0.02)
        c.raw(f'<g class="{g}">')
        c.orb(PX + 2, sy - 9.5, 11)
        tt = max(at, land - 0.4)
        while tt < until - 0.02:
            sec = int(tt - land) + 1 if tt >= land else 0
            nxt = min(until, land + sec) if tt >= land else min(until, land)
            nxt = nxt if nxt > tt + 0.02 else min(until, tt + 1)
            c.raw(f'<g class="{c.window(tt, nxt - 0.01, fade=0.005)}">')
            c.text(PX + 17, sy, f"{label} · {sec}s", 7.5, t["muted"], weight=475, extra=SHIM)
            c.raw("</g>")
            tt = nxt
        c.raw("</g>")
    p["scroll"] = scroll


def editor_idea(c, p, until):
    t, idea = c.t, p["idea"]
    land = p["land"]
    c.raw(f'<g class="{c.window(land - WHIP - 0.05, until, fade=0.04)}">')
    crumb = f"Personal  /  {idea['title']}"
    cw = tw(crumb, 8.5, 450) + 14
    c.icon("lock", EX + 320 - cw / 2, 8, 9, t["muted"])
    c.text(EX + 320 - cw / 2 + 13, 16, "Personal  /  ", 8.5, t["muted"], weight=450)
    c.text(EX + 320 - cw / 2 + 13 + tw("Personal  /  ", 8.5, 450), 16, idea["title"], 8.5, t["fg"], weight=500)
    sloppy_turn(c, p)

    # canvas: title, assets, scene, then the cards top to bottom as the camera arrives
    s = STAGE
    sx, sy = s["x"] + 16, s["y"]
    cv = land + SLOPPY + PAN - 0.35
    c.type_line(sx, sy + 30, idea["title"], cv - 0.15, cv - 0.15 + len(idea["title"]) * 0.018, 15, t["fg"], family=SLOP, weight=600)
    a = c.rise(cv - 0.1, dy=3, dur=0.25, blur=0)
    c.raw(f'<g class="{a}">')
    c.icon("chevron-down", sx, sy + 40, 9, t["muted"])
    c.text(sx + 12, sy + 48, "Assets", 8, t["muted"], weight=500)
    c.raw("</g>")
    for i, (lab, icon, img) in enumerate(idea["assets"] + [("Character", "user", "+")]):
        ax, ay = sx + i * 40, sy + 54
        a = c.rise(cv - 0.05 + i * 0.05, dy=4, dur=0.3, blur=3)
        c.raw(f'<g class="{a}">')
        if img and img != "+":
            c.photo(img, ax, ay, 30, 30, rx=6, width=96)
            c.rect(ax + 0.5, ay + 0.5, 29, 29, "none", rx=6, stroke=t["border"])
        else:
            dashed = img == "+"
            c.rect(ax, ay, 30, 30, t["secondary"] if dashed else t["card"], rx=6, stroke=t["border2"], extra='stroke-dasharray="3 2"' if dashed else "")
            c.icon(icon, ax + 8, ay + 8, 14, t["muted"])
        c.text(ax + 15, ay + 40, lab, 6.5, t["muted"], anchor="middle", weight=450)
        c.raw("</g>")
    hy = sy + 112
    a = c.rise(cv + 0.15, dy=3, dur=0.25, blur=0)
    c.raw(f'<g class="{a}">')
    c.icon("chevron-down", sx, hy - 8, 9, t["muted"])
    c.text(sx + 12, hy, "Scene 1", 8.5, t["muted"], weight=500)
    c.text(sx + 50, hy, idea["scene"], 8.5, t["muted"], weight=450, extra='font-variant-numeric="tabular-nums"')
    dx = sx + 50 + tw(idea["scene"], 8.5, 450) + 6
    c.rect(dx, hy - 8.5, tw(idea["dur"], 7.5, 450) + 8, 11, t["secondary"], rx=3)
    c.text(dx + 4, hy, idea["dur"], 7.5, t["muted"], weight=450)
    for i, ic in enumerate(("magic", "play", "x")):
        c.rect(s["x"] + s["w"] - 76 + i * 22, hy - 12, 17, 17, t["secondary"], rx=5, opacity=0.6)
        c.icon(ic, s["x"] + s["w"] - 72.5 + i * 22, hy - 8.5, 10, t["muted"], opacity=0.8)
    c.raw("</g>")
    seed0 = 3 * IDEAS.index(idea)
    for i, (kind, text, media) in enumerate(idea["cards"]):
        element(c, i, kind, text, media, cv + 0.3 + i * 0.3, seed=i + seed0)
    timeline_view(c, idea, cv + 0.3, land + SLOPPY + PAN + CANVAS + 0.3, land + EDIT, seed0)
    c.raw("</g>")


def media_frame(c, media, x, y, w, h, rx, width=360):
    """A still, a flipbook of consecutive video frames, or a still drifting like a slow camera move."""
    if isinstance(media, str):
        c.photo(media, x, y, w, h, rx=rx, width=width)
        return
    kind = media[0]
    if kind == "kb":
        cid = c.cls("kbc")
        c.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"/></clipPath>')
        if "kb" not in c._images:
            c._images.add("kb")
            c.css.append(".kb{animation:kf-kb 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:40% 50%}@keyframes kf-kb{from{transform:scale(1.02) translate(0,0)}to{transform:scale(1.16) translate(-2%,-1%)}}")
        c.raw(f'<g clip-path="url(#{cid})"><g class="kb">')
        c.photo(media[1], x, y, w, h, rx=0, width=width)
        c.raw("</g></g>")
        return
    _, name, n, dt = media
    period = n * dt
    for k in range(n):
        cls = ""
        if k:
            key = f"fb{n}-{int(dt * 100)}-{k}"
            if key not in c._images:
                c._images.add(key)
                a, b = k * dt / period * 100, (k * dt + min(0.14, dt * 0.6)) / period * 100
                c.css.append(f".{key}{{animation:kf-{key} {period:.2f}s linear infinite}}@keyframes kf-{key}{{0%,{a:.2f}%{{opacity:0}}{b:.2f}%,99.9%{{opacity:1}}100%{{opacity:0}}}}")
            cls = key
        c.raw(f'<g class="{cls}">' if cls else "<g>")
        c.photo(f"frames/{name}-{k}", x, y, w, h, rx=rx, width=width)
        c.raw("</g>")


def element(c, i, kind, text, media, t0, seed):
    t = c.t
    x, y, w, h = CARD_X, CARD_Y0 + i * (CARD_H + CARD_GAP), CARD_W, CARD_H
    a = c.rise(t0, dy=10, dur=0.4, blur=5)
    c.raw(f'<g class="{a}">')
    c.rect(x, y, w, h, t["elcard"], rx=10, stroke=t["border"])
    pw = c.type_pill(x + 8, y + 6, kind, KIND_LABEL[kind])
    model, provider = KIND_MODEL[kind]
    c.model_badge(x + 14 + pw, y + 6, model, provider=provider)
    c.icon("sliders", x + w - 22, y + 9, 11, t["muted"], opacity=0.8)
    if kind == "speech":
        c.icon("voice", x + w - 38, y + 9, 11, t["muted"], opacity=0.8)
    ih = h - 34
    c.rect(x + 8, y + 28, w - 16, ih, t["elinput"], rx=7)
    lines = wrap(text, w - 34, 8.5)[:2]
    tt = t0 + 0.12
    for j, line in enumerate(lines):
        t1 = tt + len(line) * 0.006
        c.type_line(x + 15, y + 41 + j * 12, line, tt, t1, 8.5, t["fg"])
        tt = t1
    gen = t0 + 0.75
    if media:
        ihh = h - 2
        iw = ihh * 16 / 9
        mx = COL_X + (COL_W - iw) / 2
        my = y + 1
        c.shimmer(mx, my, iw, ihh, rx=6, cls=c.window(t0, gen + 0.25, fade=0.1))
        r = c.reveal(gen)
        c.raw(f'<g class="{r}">')
        media_frame(c, media, mx, my, iw, ihh, 6)
        c.rect(mx + 0.5, my + 0.5, iw - 1, ihh - 1, "none", rx=6, stroke=t["border"], extra='stroke-opacity=".6"')
        if kind == "video":
            c.rect(mx + iw - 27, my + ihh - 14, 23, 10, t["onmedia"], rx=3, opacity=0.6)
            c.text(mx + iw - 15.5, my + ihh - 6.6, "0:05", 6.5, t["onmediafg"], anchor="middle", weight=500)
            c.raw(f'<circle cx="{mx + 12}" cy="{my + ihh - 9}" r="6" fill="{t["onmedia"]}" fill-opacity=".55"/>')
            c.icon("pause", mx + 8.5, my + ihh - 12.5, 7, t["onmediafg"])
        c.raw("</g>")
    else:
        ph, aw = 34, (h - 2) * 16 / 9
        mx = COL_X + (COL_W - aw) / 2
        my = y + (h - ph) / 2
        ap = c.window(t0, gen + 0.2, fade=0.12)
        c.audio_placeholder(mx, my, aw, ph, cls=ap, animate=False, seed=seed + 2)
        r = c.rise(gen, dy=0, dur=0.3, blur=3)
        # AudioResult: a bordered card holding the play button, the soundwave and the time
        c.raw(f'<g class="{r}">')
        c.rect(mx, my, aw, ph, t["elcard"], rx=6, stroke=t["border"])
        c.rect(mx + 5, my + ph / 2 - 8, 16, 16, t["primary"], rx=4)
        c.icon("play", mx + 8, my + ph / 2 - 5, 10, t["primaryfg"])
        c.raw("</g>")
        dur = {"speech": "0:04", "music": "0:30", "sound": "0:06"}[kind]
        tdw = tw(f"0:00/{dur}", 6.5, 450) + 2
        envelope(c, mx + 25, my + ph / 2 - 10, aw - 25 - tdw - 9, 20, t["muted"], kind, seed, gen + 0.05)
        c.text(mx + aw - 5, my + ph / 2 + 2.3, f"0:00/{dur}", 6.5, t["muted"], anchor="end", weight=450, cls=c.rise(gen + 0.1, dy=0, dur=0.2, blur=0), extra='font-variant-numeric="tabular-nums"')
    c.raw("</g>")


def peaks(kind, seed, n=120):
    """Plausible normalized peaks for a kind of audio, smoothed and floored the way soundwave.ts does."""
    import math
    import random

    rnd = random.Random(seed * 7919 + len(kind))
    out = []
    if kind == "speech":
        while len(out) < n:
            word = rnd.randint(4, 9)
            loud = rnd.uniform(0.45, 1.0)
            out += [loud * math.sin(math.pi * (i + 0.5) / word) * rnd.uniform(0.75, 1) for i in range(word)]
            out += [rnd.uniform(0, 0.06)] * rnd.choice((1, 2, 2, 4))
    elif kind == "music":
        out = [0.55 + 0.3 * math.sin(i * 0.21 + seed) * math.sin(i * 0.05) + (0.25 if i % 8 < 2 else 0) * rnd.uniform(0.6, 1) + rnd.uniform(-0.08, 0.08) for i in range(n)]
    else:
        out = [max(0.0, (math.exp(-((i - n * 0.25) / (n * 0.12)) ** 2) + 0.6 * math.exp(-((i - n * 0.62) / (n * 0.2)) ** 2)) * rnd.uniform(0.7, 1)) for i in range(n)]
    out = [min(1.0, max(0.0, v)) for v in out[:n]]
    sm = [((out[i - 1] if i else out[i]) + out[i] + (out[i + 1] if i + 1 < n else out[i])) / 3 * 100 for i in range(n)]
    return [max(4, v) for v in sm]


def envelope_points(x, y, w, h, heights):
    step = w / (len(heights) - 1)
    top = [f"{x + i * step:.1f},{y + h * (100 - v) / 200:.2f}" for i, v in enumerate(heights)]
    bot = [f"{x + i * step:.1f},{y + h * (100 + v) / 200:.2f}" for i, v in reversed(list(enumerate(heights)))]
    return " ".join(top + bot)


def envelope(c, x, y, w, h, color, kind, seed, t0, n=120):
    """The app's soundwave: peaks mirrored about the centreline into one filled shape, landing left to right."""
    pts = envelope_points(x, y, w, h, peaks(kind, seed, n))
    wid = c.cls("wc")
    c.defs.append(f'<clipPath id="{wid}"><rect class="{wid}" x="{x}" y="{y - 1}" width="{w}" height="{h + 2}"/></clipPath>')
    c.css.append(
        f".{wid}{{animation:kf-{wid} {c.loop}s cubic-bezier(.4,0,.2,1) infinite both;transform-box:fill-box;transform-origin:left center}}"
        f"@keyframes kf-{wid}{{0%,{c.pct(t0)}{{transform:scaleX(0.001)}}{c.pct(t0 + 0.45)},100%{{transform:scaleX(1)}}}}"
    )
    c.raw(f'<g clip-path="url(#{wid})"><polygon points="{pts}" fill="{color}"/></g>')


TL_LANES = [("visual", 40), ("speech", 32), ("effect", 32), ("music", 32)]
TL_LANE_OF = {"image": "visual", "video": "visual", "speech": "speech", "sound": "effect", "music": "music"}


def timeline_view(c, idea, t_build, t_play, t_end, seed0):
    """The bottom dock as the editor draws it: BottomTransportBar over the Timeline, at half scale.
    Lanes are h-20 visuals and h-16 audio on a solid surface, the ruler a dotted element-card strip,
    clips tinted frames with a header, a square footage preview or a filled soundwave, and a scene chip."""
    t = c.t
    x0, x1 = STAGE["x"], STAGE["x"] + STAGE["w"]
    total = int(idea["dur"].rstrip("s"))
    span = t_end - t_play
    # the dock is opaque: no dot grid shows through it
    c.rect(x0 - 8, TLY - 4, EX + 640 - (x0 - 8), 260, t["bg"])

    # BottomTransportBar: px-4 py-2, the segmented seek bar, then time, scene, transport, tools
    tx0, tx1 = x0 + 8, x1 - 8
    bw = tx1 - tx0
    ty = TLY + 4
    c.rect(tx0, ty, bw, 3, t["scrubtrack"], rx=1.5)
    prog = c.keys([(t_play - 0.001, "transform:scaleX(0)"), (t_end, "transform:scaleX(1)")], ease="linear", origin="left center")
    c.raw(f'<g class="{prog}"><rect x="{tx0}" y="{ty}" width="{bw}" height="3" rx="1.5" fill="{t["scrubprog"]}"/></g>')
    knob = c.keys([(t_play - 0.001, "transform:translate(0,0)"), (t_end, f"transform:translate({bw}px,0)")], ease="linear")
    c.raw(f'<g class="{knob}"><circle cx="{tx0}" cy="{ty + 1.5}" r="3.6" fill="{t["scrubprog"]}" stroke="{t["border2"]}" stroke-width="1.2"/></g>')
    ry = ty + 17
    for sec in range(total + 1):
        a = t_play + span * sec / total
        b = t_play + span * (sec + 1) / total if sec < total else t_end + 2
        c.text(tx0, ry, f"0:{sec:02d}", 8, t["fg"], weight=450, cls=c.window(a if sec else t_build - 1, b - 0.005, fade=0.002), extra='font-variant-numeric="tabular-nums"')
    c.text(tx0 + tw("0:00", 8, 450) + 3, ry, f"/ 0:{total:02d}", 8, t["muted"], weight=450, extra='font-variant-numeric="tabular-nums"')
    sp = tx0 + tw("0:00 / 0:00", 8, 450) + 10
    c.rect(sp, ry - 8.5, 36, 12, t["secondary"], rx=6)
    c.text(sp + 18, ry, "Scene 1", 7, t["fg"], anchor="middle", weight=450)
    cx = (tx0 + tx1) / 2
    c.icon("chevrons-left", cx - 26, ry - 9.5, 11, t["fg"])
    c.raw(f'<g class="{c.window(t_build - 1, t_play, fade=0.02)}">')
    c.icon("play", cx - 5.5, ry - 9.5, 11, t["fg"])
    c.raw(f'</g><g class="{c.window(t_play + 0.02, t_end + 2, fade=0.02)}">')
    c.icon("pause", cx - 5.5, ry - 9.5, 11, t["fg"])
    c.raw("</g>")
    c.icon("chevrons-right", cx + 15, ry - 9.5, 11, t["fg"])
    # TimelineZoomControl stepper, VolumeControl, FullscreenButton, BottomViewToggle
    zx = tx1 - 126
    c.rect(zx, ry - 9.5, 52, 13, t["secondary"], rx=4)
    c.icon("minus", zx + 3, ry - 7.5, 9, t["muted"])
    c.text(zx + 26, ry - 0.5, "100%", 6.5, t["fg"], anchor="middle", weight=450, extra='font-variant-numeric="tabular-nums"')
    c.icon("plus", zx + 40, ry - 7.5, 9, t["muted"])
    c.icon("volume-2", tx1 - 66, ry - 9.5, 11, t["fg"])
    c.rect(tx1 - 52, ry - 4.5, 22, 2, t["scrubtrack"], rx=1)
    c.rect(tx1 - 52, ry - 4.5, 16, 2, t["scrubprog"], rx=1)
    c.icon("maximize", tx1 - 26, ry - 9.5, 11, t["fg"])
    c.icon("timeline", tx1 - 12, ry - 9.5, 11, t["fg"])

    # Timeline: the ruler (h-7, element-card, dots in the border colour, numeric labels)
    TY = ry + 9
    RH = 14
    pps = (x1 - x0 - 20) / total
    c.rect(x0, TY, x1 - x0, RH, t["elcard"])
    interval = 2 if total <= 16 else 4
    sub = interval * pps / 4
    k = 0
    while k * sub <= x1 - x0:
        c.raw(f'<circle cx="{x0 + k * sub:.1f}" cy="{TY + RH / 2}" r="0.5" fill="{t["border"]}"/>')
        k += 1
    for sec in range(0, total + 1, interval):
        lx = x0 + sec * pps
        c.text(lx + 4 if not sec else lx, TY + RH / 2 + 2.2, f"0:{sec:02d}", 6.5, t["muted"], anchor="start" if not sec else "middle", weight=475, extra='font-variant-numeric="tabular-nums"')
    ly = TY + RH
    lane_y = {}
    for name, h in TL_LANES:
        lane_y[name] = ly
        c.raw(f'<line x1="{x0}" y1="{ly + h - 0.25}" x2="{x1}" y2="{ly + h - 0.25}" stroke="{t["border"]}" stroke-opacity=".5" stroke-width=".5"/>')
        ly += h

    cards = idea["cards"]
    visuals = [k for k in cards if k[0] in ("image", "video")]
    vlen = total / len(visuals)
    placed = [(card, i * vlen, (i + 1) * vlen) for i, card in enumerate(visuals)]
    for i, card in enumerate(k for k in cards if k[0] == "speech"):
        a = (i * 2 + 0.2) * vlen
        a = a if a < total else i * vlen
        placed.append((card, a, min(total, a + vlen * 0.85)))
    for card in cards:
        if card[0] == "sound":
            placed.append((card, total * 0.45, total * 0.7))
        if card[0] == "music":
            placed.append((card, 0, total))
    for n, (card, a, b) in enumerate(placed):
        kind, text, media = card
        lane = TL_LANE_OF[kind]
        y, h = lane_y[lane] + 1, dict(TL_LANES)[lane] - 2
        x, w = x0 + a * pps, (b - a) * pps
        tint = t["m_" + kind]
        appear = c.rise(t_build + cards.index(card) * 0.3 + 0.8, dy=0, dur=0.3, blur=2)
        c.raw(f'<g class="{appear}">')
        cid = c.cls("clc")
        c.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3"/></clipPath>')
        c.raw(f'<g clip-path="url(#{cid})">')
        c.rect(x, y, w, h, F.mix(t["elcard"], tint, 0.22))
        # ClipHeader: h-3.5, a 9px icon and the prompt in text-badge-xs
        c.icon(F.KIND_ICON[kind], x + 2.5, y + 1.25, 4.5, tint)
        lab = text
        while lab and tw(lab, 5.2, 450) > w - 12:
            lab = lab[:-2]
        if lab != text:
            lab = lab.rstrip(" ,.:") + "…"
        c.text(x + 9, y + 5.4, lab, 5.2, t["fg"], weight=450)
        by, bh = y + 7 + 1, h - 7 - 2
        if lane == "visual":
            c.rect(x + 1, by, bh, bh, F.mix(t["elcard"], tint, 0.06), rx=1.5)
            media_frame(c, media, x + 1, by, bh, bh, 1.5, width=120)
            c.rect(x + 0.5, y + h - 7.5, 22, 7, t["onmedia"], rx=1, opacity=0.65)
            c.text(x + 11.5, y + h - 2.6, "Scene 1", 5, "#ffffff", anchor="middle", weight=450)
        else:
            c.rect(x + 1, by, w - 2, bh, F.mix(t["elcard"], tint, 0.06), rx=1.5)
            c.raw(f'<polygon points="{envelope_points(x + 1, by, w - 2, bh, peaks(kind, seed0 + n, max(16, int(w))))}" fill="{tint}"/>')
        c.raw("</g>")
        c.rect(x + 0.25, y + 0.25, w - 0.5, h - 0.5, "none", rx=3, stroke=t["border"], sw=0.5)
        c.raw("</g>")
    # TimelinePlayhead: a 1px line in scrub-progress with its pentagon head
    ph = c.keys([(t_play - 0.001, "transform:translate(0,0)"), (t_end, f"transform:translate({total * pps}px,0)")], ease="linear")
    c.raw(f'<g class="{ph}"><line x1="{x0}" y1="{TY}" x2="{x0}" y2="{ly}" stroke="{t["scrubprog"]}" stroke-width=".5"/><path transform="translate({x0 - 1.75},{TY}) scale(.25)" d="M0 0h14v10l-6 7H6l-6-7z" fill="{t["scrubprog"]}"/></g>')


# =====================================================================================
# Camera
# =====================================================================================
def camera(c, keys):
    """keys: (t, cx, cy, zoom, blur, ease to next). Frames world point (cx, cy) at the view centre."""

    def tf(cx, cy, z):
        s = BASE * z
        return f"translate({VW / 2 - s * cx:.2f}px,{VH / 2 - s * cy:.2f}px) scale({s:.4f})"

    move = "".join(f"{c.pct(k[0])}{{transform:{tf(k[1], k[2], k[3])};animation-timing-function:{k[5]}}}" for k in keys)
    blur = "".join(f"{c.pct(k[0])}{{filter:{'none' if k[4] == 0 else f'blur({k[4]}px)'};animation-timing-function:{k[5]}}}" for k in keys)
    first, last = keys[0], keys[-1]
    c.css.append(
        f".cam{{transform-box:view-box;transform-origin:0 0;animation:kf-cam {c.loop}s infinite both}}"
        f"@keyframes kf-cam{{0%{{transform:{tf(first[1], first[2], first[3])}}}{move}100%{{transform:{tf(last[1], last[2], last[3])}}}}}"
        f".camf{{animation:kf-camf {c.loop}s infinite both}}@keyframes kf-camf{{0%{{filter:none}}{blur}100%{{filter:none}}}}"
    )


def main():
    timeline, total = plan()
    c = Hero(round(total, 3))
    t = c.t
    # world backdrop: the editor's "+" dot grid everywhere
    c.defs.append(f'<pattern id="plus" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 9v6M9 12h6" stroke="{t["dot"]}" stroke-opacity="{t["dotop"]}" stroke-width="1"/></pattern>')
    c.raw(f'<rect x="-600" y="-400" width="2600" height="1400" fill="{t["bg"]}"/><rect x="-600" y="-400" width="2600" height="1400" fill="url(#plus)"/>')
    composer(c, timeline)
    editor_chrome(c)
    for k, p in enumerate(timeline):
        nxt = timeline[k + 1] if k + 1 < len(timeline) else None
        until = (nxt["t"] + ARRIVE) if nxt else total
        editor_idea(c, p, until)

    io_ = "cubic-bezier(.75,0,.25,1)"
    out = "cubic-bezier(.2,.7,.1,1)"
    inout = "cubic-bezier(.45,0,.3,1)"
    keys = []
    for k, p in enumerate(timeline):
        s, land = p["t"], p["land"]
        cv = land + SLOPPY + PAN
        keys += [
            (s, 320, 160, 1.08, 16, out),
            (s + ARRIVE, 320, 157, 1.2, 0, out),
            (p["send"], 320, 152, 1.4, 0, io_),
            (p["send"] + 0.15, 322, 151, 1.44, 0, io_),
            (land - WHIP / 2, (322 + PX + 103) / 2, 140, 1.0, 20, io_),
            (land, PX + 103, 116, 2.1, 0, out),
        ]
        for at, y in p["scroll"]:
            if at < land + SLOPPY - 0.1:
                keys.append((at, PX + 103, y, 2.1, 0, inout))
        keys += [
            (land + SLOPPY, PX + 103, keys[-1][2], 2.1, 0, io_),
            (land + SLOPPY + PAN / 2, (PX + 103 + STAGE["x"] + 150) / 2, 170, 1.35, 6, io_),
            (cv, STAGE["x"] + STAGE["w"] + 8 - 320 / 1.22, 190, 1.22, 0, inout),
            (cv + CANVAS, STAGE["x"] + STAGE["w"] + 8 - 320 / 1.22, 420, 1.22, 0, io_),
            (cv + CANVAS + 0.6, STAGE["x"] + STAGE["w"] / 2, TLY + 78, 1.4, 0, out),
            (land + EDIT, STAGE["x"] + STAGE["w"] / 2 + 4, TLY + 80, 1.44, 0, io_),
            (land + EDIT + WHIP / 2, (STAGE["x"] + 200 + 320) / 2, 330, 0.8, 22, io_),
        ]
    keys.append((c.loop, 320, 160, 1.08, 16, out))
    camera(c, keys)
    c.write('<g class="camf"><g class="cam">', "</g></g>")


if __name__ == "__main__":
    main()
