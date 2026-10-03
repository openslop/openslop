import { z } from "zod";
import { AspectRatioSchema, DEFAULT_ASPECT_RATIO } from "./aspectRatio";
import {
	CaptionStyleSchema,
	DEFAULT_CAPTION_STYLE,
} from "../captions/captionStyle";
import { DEFAULT_TRANSITION, TRANSITION_TYPES } from "../render/transitions";

/** What playback and rendering read, each with a default so no reader needs a fallback. */
const settings = z.object({
	transitionType: z.enum(TRANSITION_TYPES).default(DEFAULT_TRANSITION),
	aspectRatio: AspectRatioSchema.default(DEFAULT_ASPECT_RATIO),
	captions: z.boolean().default(true),
	/** A style stored by an older build may no longer parse; the default beats not opening. */
	captionStyle: CaptionStyleSchema.catch(DEFAULT_CAPTION_STYLE),
});

export const VideoSettingsSchema = z.preprocess(
	(value) => value ?? {},
	settings,
);

export type VideoSettings = z.infer<typeof VideoSettingsSchema>;
