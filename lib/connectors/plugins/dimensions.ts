import { requireState } from "@/lib/connectors/plugins";
import {
	aspectDimensions,
	aspectRatioNode,
} from "@/lib/generation/sourceNodes";
import type { ConnectorPlugin } from "@/lib/connectors/types";

type Dimensioned = { prompt: string; width?: number; height?: number };

/** Sizes a generation from the project's aspect ratio. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		dependencies: (_, ctx) => [aspectRatioNode(ctx.state)],
		beforeGenerate(params, ctx) {
			const state = requireState(ctx, "dimensions");
			return { ...params, ...aspectDimensions(state)[kind] };
		},
	};
}
