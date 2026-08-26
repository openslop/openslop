import {
	DEFAULT_CAPTION_STYLE,
	type CaptionStyle,
	type CaptionTextStyle,
} from "./captionStyle";

export const CAPTION_PRESET_KEYS = [
	"classic",
	"karaoke",
	"pop",
	"boxed",
	"spotlight",
	"neon",
] as const;

export type CaptionPresetKey = (typeof CAPTION_PRESET_KEYS)[number];

export type CaptionPreset = {
	key: CaptionPresetKey;
	label: string;
	style: CaptionStyle;
};

const preset = (
	label: string,
	style: Partial<CaptionStyle>,
): Omit<CaptionPreset, "key"> => ({
	label,
	style: { ...DEFAULT_CAPTION_STYLE, ...style },
});

const text = (style: Partial<CaptionTextStyle>): CaptionTextStyle => ({
	...DEFAULT_CAPTION_STYLE.base,
	...style,
});

/** Keyed by {@link CAPTION_PRESET_KEYS}, so every key names exactly one preset. */
const PRESETS: Record<CaptionPresetKey, Omit<CaptionPreset, "key">> = {
	classic: preset("Classic", { alignX: "center" }),
	karaoke: preset("Karaoke", {
		font: "bangers",
		fontSize: 62,
		casing: "upper",
		reveal: "line",
		alignX: "center",
		base: text({ bold: false }),
		activeWord: text({ fill: "#6DC7C8", bold: false }),
	}),
	pop: preset("Pop", {
		font: "montserrat",
		fontSize: 40,
		casing: "none",
		reveal: "line",
		activeWord: text({ fill: "#ffe14d", bold: true }),
		alignX: "center",
		alignY: "middle",
		maxWordsPerLine: 4,
		base: text({ bold: false }),
	}),
	boxed: preset("Boxed", {
		font: "oswald",
		casing: "upper",
		reveal: "line",
		alignX: "center",
		activeWord: text({ background: "#FE2953" }),
	}),
	spotlight: preset("Spotlight", {
		reveal: "line",
		alignX: "center",
		alignY: "bottom",
	}),
	neon: preset("Neon", {
		font: "bebasNeue",
		fontSize: 80,
		casing: "upper",
		maxWordsPerLine: 1,
		alignX: "center",
		alignY: "middle",
		base: text({ border: null }),
		activeWord: text({
			fill: "#c77dff",
			italic: true,
			bold: false,
			border: { width: 40, color: "#000000" },
		}),
	}),
};

export const CAPTION_PRESETS: readonly CaptionPreset[] =
	CAPTION_PRESET_KEYS.map((key) => ({ key, ...PRESETS[key] }));

export const captionPresetStyle = (key: CaptionPresetKey): CaptionStyle =>
	PRESETS[key].style;

export const captionPresetLabel = (key: CaptionPresetKey): string =>
	PRESETS[key].label;

/** Stand-in narration for the panel previews. */
export const CAPTION_SAMPLE_WORDS = [
	"Style",
	"your",
	"captions",
	"exactly",
	"how",
	"you",
	"like",
	"them",
];
