import omit from "lodash/omit";
import type { GenerationInputs } from "@/lib/generation/queue";
import type { Metadata } from "@/lib/project/types";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import type { CanvasContentElement } from "../types";
import { ELEMENT_METADATA_INPUTS } from "../config/elementMetadataInputs";
import { getPromptText } from "./getPromptText";

export function getGenerationInputs(
	element: CanvasContentElement,
	metadata: Metadata,
): GenerationInputs {
	const resolver = ELEMENT_METADATA_INPUTS[element.type];
	const attributes: Record<string, string> = {
		...omit(element.customAttributes ?? {}, LAYOUT_ATTRIBUTE_KEYS),
		...resolver?.(element, metadata),
	};
	return { prompt: getPromptText(element), attributes };
}
