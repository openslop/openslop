import { referenceUrls } from "@/lib/canvas/assets";
import {
	parseReferenceImages,
	REFERENCE_IMAGES_ATTR,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/reference-images";
import mergeWith from "lodash/mergeWith";
import { appendArrays } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import type { Read } from "@/lib/generation/declare";

export type ParamsWithReferenceImages = {
	prompt: string;
	referenceImages?: string[];
	[REFERENCE_IMAGES_ATTR]?: string;
};

const PROJECT_REFERENCES = "the reference images";

/** Read only while inherited, so an override neither reads nor stales on the project's. */
const inheritedReferences: Read = (
	{ generationAttributes: attrs = {} },
	{ canvas },
) => ({
	[PROJECT_REFERENCES]:
		attrs[REFERENCE_IMAGES_ATTR] === undefined
			? serializeReferenceImages(referenceUrls(canvas))
			: undefined,
});

export function createReferenceImagesPlugin(): ConnectorPlugin<ParamsWithReferenceImages> {
	return {
		name: "reference-images",
		reads: [inheritedReferences],
		beforeGenerate(params, ctx) {
			const { [REFERENCE_IMAGES_ATTR]: override, ...rest } = params;
			return mergeWith(
				{},
				rest,
				{
					referenceImages:
						parseReferenceImages(override ?? ctx.reads?.[PROJECT_REFERENCES]) ??
						[],
				},
				appendArrays,
			);
		},
	};
}
