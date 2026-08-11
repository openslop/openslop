import {
	DEFAULT_CAPTION_STYLE,
	type CaptionStyle,
	type CaptionTextStyle,
} from "./captionStyle";

export type CaptionPreset = { key: string; label: string; style: CaptionStyle };

const preset = (
	key: string,
	label: string,
	style: Partial<CaptionStyle>,
): CaptionPreset => ({
	key,
	label,
	style: { ...DEFAULT_CAPTION_STYLE, ...style },
});

const text = (style: Partial<CaptionTextStyle>): CaptionTextStyle => ({
	...DEFAULT_CAPTION_STYLE.base,
	...style,
});

export const CAPTION_PRESETS: readonly CaptionPreset[] = [
	preset("classic", "Classic", {}),
	preset("karaoke", "Karaoke", {
		font: "bangers",
		fontSize: 62,
		casing: "upper",
		reveal: "line",
		activeWord: text({ fill: "#6DC7C8" }),
	}),
	preset("pop", "Pop", {
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
	preset("boxed", "Boxed", {
		font: "oswald",
		casing: "upper",
		reveal: "line",
		activeWord: text({ background: "#FE2953" }),
	}),
	preset("spotlight", "Spotlight", {
		reveal: "line",
		alignX: "center",
		alignY: "bottom",
	}),
	preset("neon", "Neon", {
		font: "bebasNeue",
		fontSize: 80,
		casing: "upper",
		maxWordsPerLine: 1,
		alignX: "center",
		alignY: "middle",
		base: text({ border: { width: 0, color: "#000000" } }),
		activeWord: text({
			fill: "#c77dff",
			italic: true,
			bold: false,
			border: { width: 40, color: "#000000" },
		}),
	}),
];

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
