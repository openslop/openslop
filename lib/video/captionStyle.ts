import { z } from "zod";
import { CAPTION_FONTS } from "./captionFonts";

export const CAPTION_CASINGS = ["none", "upper", "lower"] as const;
export type CaptionCasing = (typeof CAPTION_CASINGS)[number];

export const CAPTION_ALIGN_X = ["left", "center", "right"] as const;
export type CaptionAlignX = (typeof CAPTION_ALIGN_X)[number];

export const CAPTION_ALIGN_Y = ["top", "middle", "bottom"] as const;
export type CaptionAlignY = (typeof CAPTION_ALIGN_Y)[number];

/** Type emphasis toggles, applied per class of word. */
export type CaptionEmphasis = "bold" | "italic" | "underline";

/** `line` shows the whole line at once; `word` builds it up word by word. */
export const CAPTION_REVEALS = ["line", "word"] as const;
export type CaptionReveal = (typeof CAPTION_REVEALS)[number];

/** The frame height caption sizes are authored against. */
export const CAPTION_BASE_HEIGHT = 1080;

/** Type size scaled from the authoring baseline to a real frame height. */
export const captionFontSizePx = (fontSize: number, frameHeight: number) =>
	(fontSize * frameHeight) / CAPTION_BASE_HEIGHT;

/** Slider bounds, shared by the schema and the panel controls. */
export const CAPTION_RANGES = {
	fontSize: { min: 24, max: 160, step: 2 },
	borderWidth: { min: 5, max: 100, step: 5 },
	maxWordsPerLine: { min: 1, max: 10, step: 1 },
	activeScale: { min: 100, max: 175, step: 5 },
} as const;

const range = ({ min, max }: { min: number; max: number }) =>
	z.number().min(min).max(max);

const captionTextStyleSchema = z.object({
	fill: z.string(),
	bold: z.boolean(),
	italic: z.boolean(),
	underline: z.boolean(),
	border: z
		.object({ width: range(CAPTION_RANGES.borderWidth), color: z.string() })
		.nullable(),
	background: z.string().nullable(),
});

/** How one class of word is drawn; a `null` layer is off. */
export type CaptionTextStyle = z.infer<typeof captionTextStyleSchema>;

export const CaptionStyleSchema = z.object({
	font: z.enum(CAPTION_FONTS),
	/**
	 * Pixels at {@link CAPTION_BASE_HEIGHT}. Renderers scale it by the real frame
	 * height, so one value covers every output resolution.
	 */
	fontSize: range(CAPTION_RANGES.fontSize),
	casing: z.enum(CAPTION_CASINGS),
	alignX: z.enum(CAPTION_ALIGN_X),
	alignY: z.enum(CAPTION_ALIGN_Y),
	maxWordsPerLine: range(CAPTION_RANGES.maxWordsPerLine).int(),
	reveal: z.enum(CAPTION_REVEALS),
	base: captionTextStyleSchema,
	/**
	 * Emphasis for the word being spoken. `scale` is a percentage of `fontSize`,
	 * so the active word keeps its proportion when the caption is resized.
	 */
	activeWord: captionTextStyleSchema.extend({
		scale: range(CAPTION_RANGES.activeScale),
	}),
});

export type CaptionStyle = z.infer<typeof CaptionStyleSchema>;

const WHITE = "#ffffff";
const BLACK = "#000000";

/** Thickness a border starts at when switched on. */
export const DEFAULT_BORDER_WIDTH = 25;

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
	font: "montserrat",
	fontSize: 70,
	casing: "upper",
	alignX: "center",
	alignY: "bottom",
	maxWordsPerLine: 6,
	reveal: "word",
	base: {
		fill: WHITE,
		bold: true,
		italic: false,
		underline: false,
		border: { width: DEFAULT_BORDER_WIDTH, color: BLACK },
		background: null,
	},
	activeWord: {
		fill: WHITE,
		bold: true,
		italic: false,
		underline: false,
		border: { width: DEFAULT_BORDER_WIDTH, color: BLACK },
		background: null,
		scale: 100,
	},
};

/** Swatches offered by the caption color pickers. */
export const CAPTION_PALETTE = [
	WHITE,
	"#d4d4d4",
	"#7d7d7d",
	BLACK,
	"#ffe14d",
	"#ff9f43",
	"#ff4d6d",
	"#c77dff",
	"#4dabf7",
	"#43e97b",
] as const;

export const resolveCaptionStyle = (metadata: {
	videoSettings?: { captionStyle?: CaptionStyle };
}): CaptionStyle =>
	metadata.videoSettings?.captionStyle ?? DEFAULT_CAPTION_STYLE;
