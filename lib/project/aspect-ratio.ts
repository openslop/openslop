import { z } from "zod";

export const ASPECT_RATIOS = ["16:9", "9:16"] as const;

export const AspectRatioSchema = z.enum(ASPECT_RATIOS);

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";

export const MEDIA_RESOLUTIONS = ["720p", "1080p", "1152p", "1440p"] as const;

export type MediaResolution = (typeof MEDIA_RESOLUTIONS)[number];

export type Dimensions = { width: number; height: number };

export const ASPECT_RATIO_DIMENSIONS: Record<
	AspectRatio,
	{
		sizes: Record<MediaResolution, Dimensions>;
		output: Dimensions;
	}
> = {
	"16:9": {
		sizes: {
			"720p": { width: 1280, height: 720 },
			"1080p": { width: 1920, height: 1080 },
			"1152p": { width: 2048, height: 1152 },
			"1440p": { width: 2560, height: 1440 },
		},
		output: { width: 1920, height: 1080 },
	},
	"9:16": {
		sizes: {
			"720p": { width: 720, height: 1280 },
			"1080p": { width: 1080, height: 1920 },
			"1152p": { width: 1152, height: 2048 },
			"1440p": { width: 1440, height: 2560 },
		},
		output: { width: 1080, height: 1920 },
	},
};

/** The frame render presets and caption sizes are measured against. */
export const BASE_OUTPUT = ASPECT_RATIO_DIMENSIONS["16:9"].output;

export function getAspectRatioValue(ratio: AspectRatio): number {
	const { width, height } = ASPECT_RATIO_DIMENSIONS[ratio].output;
	return width / height;
}
