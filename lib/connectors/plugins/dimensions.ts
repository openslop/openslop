import type { ConnectorPlugin } from "@/lib/connectors/types";
import { read } from "@/lib/generation/declare";
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

const aspectRatio = read(
	"the aspect ratio",
	(_, { state }) => state.videoSettings.aspectRatio,
);

/** Sizes a generation from the project's aspect ratio, and a video from its resolution too. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		reads: [aspectRatio],
		beforeGenerate(params, ctx) {
			const dims =
				ASPECT_RATIO_DIMENSIONS[
					AspectRatioSchema.parse(aspectRatio.value(ctx))
				];
			if (kind === "image") return { ...params, ...dims.image };
			const resolution = params.resolution ?? DEFAULT_VIDEO_RESOLUTION;
			return { ...params, resolution, ...dims.video[resolution] };
		},
	};
}
