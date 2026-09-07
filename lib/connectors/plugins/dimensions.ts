import { requireState } from "@/lib/connectors/plugins";
import { aspectDimensions, forAspectRatio } from "@/lib/generation/sourceNodes";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import {
	DEFAULT_VIDEO_RESOLUTION,
	type VideoResolution,
} from "@/lib/video/aspectRatio";

type Dimensioned = {
	prompt: string;
	width?: number;
	height?: number;
	resolution?: VideoResolution;
};

/** Sizes a generation from the project's aspect ratio, and a video from its resolution too. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		dependencies: () => [forAspectRatio],
		beforeGenerate(params, ctx) {
			const dims = aspectDimensions(requireState(ctx, "dimensions"));
			if (kind === "image") return { ...params, ...dims.image };
			const resolution = params.resolution ?? DEFAULT_VIDEO_RESOLUTION;
			return { ...params, resolution, ...dims.video[resolution] };
		},
	};
}
