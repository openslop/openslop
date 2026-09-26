import {
	parseReferenceImages,
	REFERENCE_IMAGES_ATTR,
} from "@/lib/connectors/attributes/referenceImages";
import { requireContext } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { dependency } from "@/lib/generation/dependency";
import { forReferenceImages } from "@/lib/generation/sourceNodes";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
	[REFERENCE_IMAGES_ATTR]?: string;
};

/** Declared only while inherited, so an override neither reads nor stales on project references. */
export const projectReferenceImages = dependency(
	"referenceImages",
	(element) =>
		element.generationAttributes?.[REFERENCE_IMAGES_ATTR] === undefined
			? forReferenceImages
			: null,
);

export function createReferenceImagesPlugin(): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		dependencies: [projectReferenceImages],
		beforeGenerate(params, ctx) {
			const {
				referenceImages: existing = [],
				[REFERENCE_IMAGES_ATTR]: override,
				...rest
			} = params;
			const urls = [
				...existing,
				...(parseReferenceImages(override) ??
					requireContext(ctx, "state", "reference-images").referenceImages),
			];
			return urls.length === 0 ? rest : { ...rest, referenceImages: urls };
		},
	};
}
