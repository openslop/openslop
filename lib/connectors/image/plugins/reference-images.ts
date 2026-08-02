import { requireState } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { forReferenceImages } from "@/lib/generation/sourceNodes";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
};

export function createReferenceImagesPlugin(): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		dependencies: () => [forReferenceImages],
		beforeGenerate(params, ctx) {
			const { referenceImages: existing = [], ...rest } = params;
			const stateImages = requireState(ctx, "reference-images").referenceImages;
			if (stateImages.length === 0 && existing.length === 0) return params;
			return { ...rest, referenceImages: [...existing, ...stateImages] };
		},
	};
}
