export type AspectRatio = "16:9" | "9:16";

export const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";

export const ASPECT_RATIO_DIMENSIONS: Record<
	AspectRatio,
	{
		image: { width: number; height: number };
		video: { width: number; height: number };
		output: { width: number; height: number };
	}
> = {
	"16:9": {
		image: { width: 2560, height: 1440 },
		video: { width: 1280, height: 720 },
		output: { width: 1920, height: 1080 },
	},
	"9:16": {
		image: { width: 1440, height: 2560 },
		video: { width: 720, height: 1280 },
		output: { width: 1080, height: 1920 },
	},
};

export function getAspectRatioValue(ratio: AspectRatio): number {
	const { width, height } = ASPECT_RATIO_DIMENSIONS[ratio].video;
	return width / height;
}
