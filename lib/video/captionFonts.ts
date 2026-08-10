/**
 * The caption faces, self-hosted so the editor preview and the Lambda render
 * draw with the same glyphs. Each entry names a real font family, so one
 * `font-family` value works in both once the files are loaded — the browser
 * gets them from `app/caption-fonts.css`, the renderer from
 * `remotion/loadCaptionFonts.ts`.
 */
export type CaptionFontFile = {
	/** Path under `public/fonts`. */
	file: string;
	/** A range covers a variable font; a single value covers a static cut. */
	weight: string;
};

export type CaptionFontSpec = {
	label: string;
	/** Stands in while the file loads. */
	fallback: string;
	files: CaptionFontFile[];
};

const VARIABLE = "100 900";

/** Ordered as the picker lists them: workhorses first, display faces last. */
export const CAPTION_FONT_SPECS = {
	inter: {
		label: "Inter",
		fallback: "sans-serif",
		files: [{ file: "InterVariable.woff2", weight: VARIABLE }],
	},
	montserrat: {
		label: "Montserrat",
		fallback: "sans-serif",
		files: [{ file: "captions/Montserrat.woff2", weight: VARIABLE }],
	},
	poppins: {
		label: "Poppins",
		fallback: "sans-serif",
		files: [
			{ file: "captions/Poppins-400.woff2", weight: "400" },
			{ file: "captions/Poppins-700.woff2", weight: "700" },
		],
	},
	roboto: {
		label: "Roboto",
		fallback: "sans-serif",
		files: [{ file: "captions/Roboto.woff2", weight: VARIABLE }],
	},
	jost: {
		label: "Jost",
		fallback: "sans-serif",
		files: [{ file: "captions/Jost.woff2", weight: VARIABLE }],
	},
	robotoCondensed: {
		label: "Roboto Condensed",
		fallback: "sans-serif",
		files: [{ file: "captions/RobotoCondensed.woff2", weight: VARIABLE }],
	},
	barlowCondensed: {
		label: "Barlow Condensed",
		fallback: "sans-serif",
		files: [
			{ file: "captions/BarlowCondensed-400.woff2", weight: "400" },
			{ file: "captions/BarlowCondensed-700.woff2", weight: "700" },
		],
	},
	oswald: {
		label: "Oswald",
		fallback: "sans-serif",
		files: [{ file: "captions/Oswald.woff2", weight: VARIABLE }],
	},
	bebasNeue: {
		label: "Bebas Neue",
		fallback: "sans-serif",
		files: [{ file: "captions/BebasNeue-400.woff2", weight: "400" }],
	},
	anton: {
		label: "Anton",
		fallback: "sans-serif",
		files: [{ file: "captions/Anton-400.woff2", weight: "400" }],
	},
	archivoBlack: {
		label: "Archivo Black",
		fallback: "sans-serif",
		files: [{ file: "captions/ArchivoBlack-400.woff2", weight: "400" }],
	},
	bangers: {
		label: "Bangers",
		fallback: "cursive",
		files: [{ file: "captions/Bangers-400.woff2", weight: "400" }],
	},
} as const satisfies Record<string, CaptionFontSpec>;

export const CAPTION_FONTS = Object.keys(CAPTION_FONT_SPECS) as CaptionFont[];

export type CaptionFont = keyof typeof CAPTION_FONT_SPECS;

export const captionFontLabel = (font: CaptionFont): string =>
	CAPTION_FONT_SPECS[font].label;

export const captionFontStack = (font: CaptionFont): string => {
	const { label, fallback } = CAPTION_FONT_SPECS[font];
	return `"${label}", ${fallback}`;
};

/**
 * Registers every caption face with the document. Callers supply the URL for a
 * file, since the editor serves `public/` at the site root while the renderer
 * resolves bundled assets itself.
 */
export function loadCaptionFonts(url: (file: string) => string): Promise<void> {
	const faces = Object.values(CAPTION_FONT_SPECS).flatMap((spec) =>
		spec.files.map(async ({ file, weight }) => {
			const face = new FontFace(spec.label, `url(${url(file)})`, { weight });
			document.fonts.add(await face.load());
		}),
	);
	return Promise.all(faces).then(() => undefined);
}
