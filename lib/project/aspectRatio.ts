export const ASPECT_RATIOS = ["16:9", "9:16"] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";

export const VIDEO_RESOLUTIONS = ["720p", "1080p"] as const;

export type VideoResolution = (typeof VIDEO_RESOLUTIONS)[number];

export const DEFAULT_VIDEO_RESOLUTION: VideoResolution = "720p";

export type Dimensions = { width: number; height: number };

export const ASPECT_RATIO_DIMENSIONS: Record<
	AspectRatio,
	{
		image: Dimensions;
		video: Record<VideoResolution, Dimensions>;
		output: Dimensions;
	}
> = {
	"16:9": {
		image: { width: 2560, height: 1440 },
		video: {
			"720p": { width: 1280, height: 720 },
			"1080p": { width: 1920, height: 1080 },
		},
		output: { width: 1920, height: 1080 },
	},
	"9:16": {
		image: { width: 1440, height: 2560 },
		video: {
			"720p": { width: 720, height: 1280 },
			"1080p": { width: 1080, height: 1920 },
		},
		output: { width: 1080, height: 1920 },
	},
};

export function getAspectRatioValue(ratio: AspectRatio): number {
	const { width, height } = ASPECT_RATIO_DIMENSIONS[ratio].output;
	return width / height;
}
