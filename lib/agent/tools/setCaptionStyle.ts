import dedent from "dedent";
import { z } from "zod";
import {
	CAPTION_PRESET_KEYS,
	captionPresetLabel,
	captionPresetStyle,
} from "@/lib/video/captionPresets";
import {
	CAPTION_ALIGN_X,
	CAPTION_ALIGN_Y,
	CAPTION_CASINGS,
	CAPTION_PALETTE,
	CAPTION_RANGES,
	CAPTION_REVEALS,
	CaptionStyleSchema,
} from "@/lib/video/captionStyle";
import { CAPTION_FONTS } from "@/lib/video/captionFonts";
import { defineTool } from "./defineTool";
import { named, notEmpty } from "./inputs";

/** Derived from the style itself, so the tool can express exactly what the panel can. */
const textStylePatch = CaptionStyleSchema.shape.base.partial();

const stylePatch = CaptionStyleSchema.partial().extend({
	base: textStylePatch.optional(),
	activeWord: textStylePatch.optional(),
});

const range = ({ min, max }: { min: number; max: number }) =>
	`${min} to ${max}`;

export const setCaptionStyle = defineTool({
	description: dedent`
	  Style the captions burned into the video, or turn them off. Send only what changes.

	  A preset resets the whole look; anything else you send applies on top of it. Without a
	  preset, changes apply to the style the project already has.

	  - preset: ${CAPTION_PRESET_KEYS.join(", ")}
	  - font: ${CAPTION_FONTS.join(", ")}
	  - fontSize: ${range(CAPTION_RANGES.fontSize)}, authored against a 1080px-tall frame
	  - casing: ${CAPTION_CASINGS.join(", ")}
	  - alignX: ${CAPTION_ALIGN_X.join(", ")}; alignY: ${CAPTION_ALIGN_Y.join(", ")}
	  - maxWordsPerLine: ${range(CAPTION_RANGES.maxWordsPerLine)}
	  - reveal: ${CAPTION_REVEALS.join(", ")}. line shows the whole line at once; word builds it up word by word
	  - base is every word; activeWord is the word being spoken. Each takes fill, bold,
	    italic, underline, a border (width ${range(CAPTION_RANGES.borderWidth)} plus a color)
	    or null for none, and a background color or null for none.

	  Colors are hex. The pickers offer ${CAPTION_PALETTE.join(", ")}; prefer those unless the
	  user names a color of their own.
	`,
	input: stylePatch
		.extend({
			preset: z.enum(CAPTION_PRESET_KEYS).optional(),
			captions: z
				.boolean()
				.optional()
				.describe("Whether captions are drawn at all."),
		})
		.refine(notEmpty, named("caption setting")),
	output: z.string(),
	execute: async ({ preset, captions, ...overrides }, ctx) => {
		const from =
			preset !== undefined
				? captionPresetStyle(preset)
				: ctx.readMetadata().videoSettings.captionStyle;

		// Parsed back into a whole style so what is persisted is never a partial.
		const captionStyle = CaptionStyleSchema.parse({
			...from,
			...overrides,
			base: { ...from.base, ...overrides.base },
			activeWord: { ...from.activeWord, ...overrides.activeWord },
		});

		ctx.setMetadata({
			videoSettings: {
				captionStyle,
				...(captions !== undefined && { captions }),
			},
		});

		const changed = [
			preset !== undefined && `the ${captionPresetLabel(preset)} preset`,
			...Object.keys(overrides),
			captions === true && "captions on",
			captions === false && "captions off",
		].filter(Boolean);

		return `Set ${changed.join(", ")}. The captions panel and the preview show it now.`;
	},
});
