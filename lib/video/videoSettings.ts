import { z } from "zod";
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from "./aspectRatio";
import { CaptionStyleSchema, DEFAULT_CAPTION_STYLE } from "./captionStyle";
import { DEFAULT_TRANSITION, TRANSITION_TYPES } from "./transitions";
import { DEFAULT_VIDEO_LENGTH, VIDEO_LENGTHS } from "./videoLength";

/**
 * Every knob that shapes the finished video, with its default. Parsed metadata
 * therefore always carries a complete set, so no reader re-applies a fallback
 * and a new setting cannot be added without one.
 */
const settings = z.object({
	transitionType: z.enum(TRANSITION_TYPES).default(DEFAULT_TRANSITION),
	aspectRatio: z.enum(ASPECT_RATIOS).default(DEFAULT_ASPECT_RATIO),
	length: z.enum(VIDEO_LENGTHS).default(DEFAULT_VIDEO_LENGTH),
	captions: z.boolean().default(true),
	/** A style stored by an older build may no longer parse; the default beats not opening. */
	captionStyle: CaptionStyleSchema.catch(DEFAULT_CAPTION_STYLE),
});

export const VideoSettingsSchema = z.preprocess(
	(value) => value ?? {},
	settings,
);

export type VideoSettings = z.infer<typeof VideoSettingsSchema>;
