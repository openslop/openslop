import {
	DEFAULT_BORDER_WIDTH,
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

const OUTLINE = { width: DEFAULT_BORDER_WIDTH, color: "#000000" };

export const CAPTION_PRESETS: readonly CaptionPreset[] = [
	preset("classic", "Classic", {}),
	preset("karaoke", "Karaoke", {
		reveal: "line",
		activeWord: { ...text({ fill: "#43e97b" }), scale: 100 },
	}),
	preset("pop", "Pop", {
		font: "rounded",
		activeWord: { ...text({ fill: "#ffe14d" }), scale: 140 },
	}),
	preset("boxed", "Boxed", {
		casing: "none",
		reveal: "line",
		base: text({ border: null, background: "#000000" }),
		activeWord: {
			...text({ fill: "#000000", border: null, background: "#ffe14d" }),
			scale: 100,
		},
	}),
	preset("spotlight", "Spotlight", {
		reveal: "line",
		base: text({ fill: "#7d7d7d", border: null }),
		activeWord: { ...text({ border: null }), scale: 110 },
	}),
	preset("neon", "Neon", {
		font: "condensed",
		casing: "upper",
		base: text({ italic: true, border: { width: 40, color: "#c77dff" } }),
		activeWord: {
			...text({
				fill: "#c77dff",
				italic: true,
				border: { ...OUTLINE, width: 40 },
			}),
			scale: 100,
		},
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
