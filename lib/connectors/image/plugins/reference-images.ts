import { referenceUrls } from "@/lib/canvas/assets";
import {
	parseReferenceImages,
	REFERENCE_IMAGES_ATTR,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/referenceImages";
import { withReferences } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { reading } from "@/lib/generation/dependency";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
	[REFERENCE_IMAGES_ATTR]?: string;
};

/** Read only while inherited, so an override neither reads nor stales on the project's. */
const projectReferences = reading(
	"the reference images",
	(element, { canvas }) =>
		element.generationAttributes?.[REFERENCE_IMAGES_ATTR] === undefined
			? serializeReferenceImages(referenceUrls(canvas))
			: undefined,
);

export function createReferenceImagesPlugin(): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		reads: projectReferences.reads,
		beforeGenerate(params, ctx) {
			const { [REFERENCE_IMAGES_ATTR]: override, ...rest } = params;
			return withReferences(
				rest,
				parseReferenceImages(override ?? projectReferences.value(ctx)) ?? [],
			);
		},
	};
}
