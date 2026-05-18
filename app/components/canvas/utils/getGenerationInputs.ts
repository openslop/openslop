import omit from "lodash/omit";
import type { GenerationInputs } from "@/lib/generation/queue";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import type { CanvasContentElement } from "../types";
import { getPromptText } from "./getPromptText";

export function getGenerationInputs(
	element: CanvasContentElement,
): GenerationInputs {
	return {
		prompt: getPromptText(element),
		attributes: omit(element.customAttributes ?? {}, LAYOUT_ATTRIBUTE_KEYS),
	};
}
