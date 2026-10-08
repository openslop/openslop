import dedent from "dedent";
import merge from "lodash/merge";
import { z } from "zod";
import {
	CAPTION_PRESET_KEYS,
	captionPresetLabel,
	captionPresetStyle,
} from "@/lib/captions/captionPresets";
import {
	CAPTION_ALIGN_X,
	CAPTION_ALIGN_Y,
	CAPTION_BASE_HEIGHT,
	CAPTION_CASINGS,
	CAPTION_PALETTE,
	CAPTION_RANGES,
	CAPTION_REVEALS,
	CaptionStyleSchema,
} from "@/lib/captions/captionStyle";
import { CAPTION_FONTS } from "@/lib/captions/captionFonts";
import { Film } from "@/components/ui/icon";
import { ASPECT_RATIOS, AspectRatioSchema } from "@/lib/project/aspectRatio";
import { TRANSITION_TYPES } from "@/lib/render/transitions";
import { defineTool } from "./defineTool";
import { atLeastOne } from "./inputs";

/** Derived from the style itself, so the tool can express exactly what the panel can. */
const textStylePatch = CaptionStyleSchema.shape.base.partial();

const stylePatch = CaptionStyleSchema.partial().extend({
	base: textStylePatch.optional(),
	activeWord: textStylePatch.optional(),
});

const range = ({ min, max }: { min: number; max: number }) =>
	`${min} to ${max}`;

export const updateVideoSettings = defineTool({
	description: dedent`
	  Change how the video looks: its aspect ratio, the transition between scenes and the
	  captions burned into it. Send only what changes. It applies to the preview and the export
	  right away. To change how long the video runs, use update_script_settings.

	  - aspectRatio: ${ASPECT_RATIOS.join(", ")}
	  - transitionType: ${TRANSITION_TYPES.join(", ")}
	  - captions: whether captions are drawn at all
	  - captionPreset: ${CAPTION_PRESET_KEYS.join(", ")}. A preset resets the whole caption look;
	    a captionStyle sent with it applies on top. Without one, captionStyle changes apply to
	    the style the project already has.
	  - captionStyle:
	    - font: ${CAPTION_FONTS.join(", ")}
	    - fontSize: ${range(CAPTION_RANGES.fontSize)}, authored against a ${CAPTION_BASE_HEIGHT}px-tall frame
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
	input: z
		.object({
			aspectRatio: AspectRatioSchema.optional(),
			transitionType: z.enum(TRANSITION_TYPES).optional(),
			captions: z.boolean().optional(),
			captionPreset: z.enum(CAPTION_PRESET_KEYS).optional(),
			captionStyle: stylePatch.optional(),
		})
		.refine(...atLeastOne("video setting")),
	output: z.string(),
	icon: Film,
	label: "Updating the video settings",
	execute: async ({ captionPreset, captionStyle, ...rest }, ctx) => {
		const style = captionPreset
			? merge({}, captionPresetStyle(captionPreset), captionStyle)
			: captionStyle;
		ctx.updateVideoSettings({ ...rest, ...(style && { captionStyle: style }) });

		const changed = [
			...Object.entries(rest).map(([key, value]) => `${key} to ${value}`),
			captionPreset &&
				`the ${captionPresetLabel(captionPreset)} caption preset`,
			...Object.keys(captionStyle ?? {}).map((key) => `caption ${key}`),
		].filter(Boolean);

		return `Set ${changed.join(", ")}. The preview and the export show it now.`;
	},
});
