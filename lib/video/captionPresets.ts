import {
	DEFAULT_BORDER_WIDTH,
	DEFAULT_CAPTION_STYLE,
	type CaptionStyle,
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

const OUTLINE = { width: DEFAULT_BORDER_WIDTH, color: "#000000" };

export const CAPTION_PRESETS: readonly CaptionPreset[] = [
	preset("classic", "Classic", {}),
	preset("karaoke", "Karaoke", {
		reveal: "line",
		base: { fill: "#ffffff", border: OUTLINE, background: null },
		activeWord: {
			fill: "#43e97b",
			border: OUTLINE,
			background: null,
			scale: 100,
		},
	}),
	preset("pop", "Pop", {
		font: "rounded",
		activeWord: {
			fill: "#ffe14d",
			border: OUTLINE,
			background: null,
			scale: 140,
		},
	}),
	preset("boxed", "Boxed", {
		casing: "none",
		reveal: "line",
		base: { fill: "#ffffff", border: null, background: "#000000" },
		activeWord: {
			fill: "#000000",
			border: null,
			background: "#ffe14d",
			scale: 100,
		},
	}),
	preset("spotlight", "Spotlight", {
		reveal: "line",
		base: { fill: "#7d7d7d", border: null, background: null },
		activeWord: { fill: "#ffffff", border: null, background: null, scale: 110 },
	}),
	preset("neon", "Neon", {
		font: "condensed",
		base: {
			fill: "#ffffff",
			border: { width: 40, color: "#c77dff" },
			background: null,
		},
		activeWord: {
			fill: "#c77dff",
			border: { width: 40, color: "#000000" },
			background: null,
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
