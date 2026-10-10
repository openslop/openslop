import type { ConnectorPlugin } from "@/lib/connectors/types";
import {
	ASPECT_RATIO_DIMENSIONS,
	AspectRatioSchema,
	DEFAULT_VIDEO_RESOLUTION,
	type VideoResolution,
} from "@/lib/project/aspectRatio";

type Dimensioned = {
	prompt: string;
	width?: number;
	height?: number;
	resolution?: VideoResolution;
};

const ASPECT_RATIO = "the aspect ratio";

/** Sizes a generation from the project's aspect ratio, and a video from its resolution too. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		reads: [
			(_, { state }) => ({ [ASPECT_RATIO]: state.videoSettings.aspectRatio }),
		],
		beforeGenerate(params, ctx) {
			const dims =
				ASPECT_RATIO_DIMENSIONS[
					AspectRatioSchema.parse(ctx.reads?.[ASPECT_RATIO])
				];
			if (kind === "image") return { ...params, ...dims.image };
			const resolution = params.resolution ?? DEFAULT_VIDEO_RESOLUTION;
			return { ...params, resolution, ...dims.video[resolution] };
		},
	};
}
