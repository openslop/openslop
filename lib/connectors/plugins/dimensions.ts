import { requireState } from "@/lib/connectors/plugins";
import { aspectDimensions, forAspectRatio } from "@/lib/generation/sourceNodes";
import type { ConnectorPlugin } from "@/lib/connectors/types";

type Dimensioned = { prompt: string; width?: number; height?: number };

/** Sizes a generation from the project's aspect ratio. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		dependencies: () => [forAspectRatio],
		beforeGenerate(params, ctx) {
			const state = requireState(ctx, "dimensions");
			return { ...params, ...aspectDimensions(state)[kind] };
		},
	};
}
