import type {
	ConnectorPlugin,
	ModelRef,
	VideoGenerateParams,
} from "@/lib/connectors/types";
import { modelEntry, renderSize } from "../models";
import { AspectRatioSchema } from "@/lib/project/aspect-ratio";

type Dimensioned = ModelRef &
	Pick<VideoGenerateParams, "prompt" | "width" | "height" | "resolution">;

const ASPECT_RATIO = "the aspect ratio";

export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		reads: [
			(_, { state }) => ({ [ASPECT_RATIO]: state.videoSettings.aspectRatio }),
		],
		beforeGenerate: (params, ctx) => ({
			...params,
			...renderSize(
				modelEntry(kind, params),
				AspectRatioSchema.parse(ctx.reads?.[ASPECT_RATIO]),
				params.resolution,
			),
		}),
	};
}
