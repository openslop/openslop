import { z } from "zod";

export const CAPTION_FONTS = [
	"sans",
	"condensed",
	"serif",
	"mono",
	"rounded",
] as const;

export type CaptionFont = (typeof CAPTION_FONTS)[number];

/**
 * Stacks rather than webfonts: the Lambda renderer only has the fonts its
 * headless Chrome ships with, so a caption font has to degrade on its own.
 */
export const CAPTION_FONT_STACKS: Record<CaptionFont, string> = {
	sans: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
	condensed: '"Arial Narrow", "Liberation Sans Narrow", Impact, sans-serif',
	serif: 'Georgia, "Times New Roman", Times, serif',
	mono: 'ui-monospace, "DejaVu Sans Mono", "Courier New", monospace',
	rounded: '"Trebuchet MS", Verdana, system-ui, sans-serif',
};

export const CAPTION_CASINGS = ["none", "upper", "lower"] as const;
export type CaptionCasing = (typeof CAPTION_CASINGS)[number];

export const CAPTION_POSITIONS = ["top", "middle", "bottom"] as const;
export type CaptionPosition = (typeof CAPTION_POSITIONS)[number];

/** `line` shows the whole line at once; `word` builds it up word by word. */
export const CAPTION_REVEALS = ["line", "word"] as const;
export type CaptionReveal = (typeof CAPTION_REVEALS)[number];

/** Slider bounds, shared by the schema and the panel controls. */
export const CAPTION_RANGES = {
	fontSize: { min: 3, max: 14, step: 0.5 },
	borderWidth: { min: 5, max: 100, step: 5 },
	maxWordsPerLine: { min: 1, max: 10, step: 1 },
	activeScale: { min: 100, max: 175, step: 5 },
} as const;

const range = ({ min, max }: { min: number; max: number }) =>
	z.number().min(min).max(max);

const captionTextStyleSchema = z.object({
	fill: z.string(),
	border: z
		.object({ width: range(CAPTION_RANGES.borderWidth), color: z.string() })
		.nullable(),
	background: z.string().nullable(),
});

/** Colors for one class of word. `null` means the layer is off. */
export type CaptionTextStyle = z.infer<typeof captionTextStyleSchema>;

export const CaptionStyleSchema = z.object({
	font: z.enum(CAPTION_FONTS),
	/** Percentage of the frame height, so captions scale with the output size. */
	fontSize: range(CAPTION_RANGES.fontSize),
	casing: z.enum(CAPTION_CASINGS),
	position: z.enum(CAPTION_POSITIONS),
	maxWordsPerLine: range(CAPTION_RANGES.maxWordsPerLine).int(),
	reveal: z.enum(CAPTION_REVEALS),
	base: captionTextStyleSchema,
	/** Emphasis for the word being spoken; `scale` is a percentage of `fontSize`. */
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
	font: "sans",
	fontSize: 6.5,
	casing: "upper",
	position: "bottom",
	maxWordsPerLine: 6,
	reveal: "word",
	base: {
		fill: WHITE,
		border: { width: DEFAULT_BORDER_WIDTH, color: BLACK },
		background: null,
	},
	activeWord: {
		fill: WHITE,
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
