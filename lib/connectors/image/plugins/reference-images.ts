import {
	parseReferenceImages,
	REFERENCE_IMAGES_ATTR,
} from "@/lib/connectors/attributes/referenceImages";
import { requireState } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { forReferenceImages } from "@/lib/generation/sourceNodes";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
	[REFERENCE_IMAGES_ATTR]?: string;
};

/**
 * Reference images for the generation: the element's own when it carries an
 * override, the project's otherwise. An overriding element declares no project
 * dependency, so project references neither reach it nor stale it.
 */
export function createReferenceImagesPlugin(): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		dependencies: (element) =>
			element.customAttributes?.[REFERENCE_IMAGES_ATTR] === undefined
				? [forReferenceImages]
				: [],
		beforeGenerate(params, ctx) {
			const {
				referenceImages: existing = [],
				[REFERENCE_IMAGES_ATTR]: override,
				...rest
			} = params;
			const urls = [
				...existing,
				...(parseReferenceImages(override) ??
					requireState(ctx, "reference-images").referenceImages),
			];
			return urls.length === 0 ? rest : { ...rest, referenceImages: urls };
		},
	};
}
