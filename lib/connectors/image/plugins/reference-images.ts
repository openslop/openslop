import { referenceUrls } from "@/lib/canvas/assets";
import {
	parseReferenceImages,
	REFERENCE_IMAGES_ATTR,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/referenceImages";
import { withReferences } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
	[REFERENCE_IMAGES_ATTR]?: string;
};

const PROJECT_REFERENCES = "the reference images";

export function createReferenceImagesPlugin(): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		/** Read only while inherited, so an override neither reads nor stales on the project's. */
		reads: ({ generationAttributes: attrs = {} }, { canvas }) => ({
			[PROJECT_REFERENCES]:
				attrs[REFERENCE_IMAGES_ATTR] === undefined
					? serializeReferenceImages(referenceUrls(canvas))
					: undefined,
		}),
		beforeGenerate(params, ctx) {
			const { [REFERENCE_IMAGES_ATTR]: override, ...rest } = params;
			return withReferences(
				rest,
				parseReferenceImages(override ?? ctx.reads?.[PROJECT_REFERENCES]) ?? [],
			);
		},
	};
}
