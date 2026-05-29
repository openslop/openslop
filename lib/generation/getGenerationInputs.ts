import omit from "lodash/omit";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { Metadata } from "@/lib/project/types";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import { ELEMENT_METADATA_INPUTS } from "./elementMetadataInputs";
import type { GenerationInputs } from "./generationInputs";
import { getPromptText } from "./getPromptText";

export function getGenerationInputs(
	element: CanvasContentElement,
	metadata: Metadata,
): GenerationInputs {
	return {
		prompt: getPromptText(element),
		attributes: {
			...omit(element.customAttributes ?? {}, LAYOUT_ATTRIBUTE_KEYS),
			...ELEMENT_METADATA_INPUTS[element.type]?.(element, metadata),
		},
	};
}
