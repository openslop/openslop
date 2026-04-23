import type { GenerationInputs } from "@/lib/generation/queue";
import type { CanvasContentElement } from "../types";
import { getPromptText } from "./getPromptText";

export function getGenerationInputs(
	element: CanvasContentElement,
): GenerationInputs {
	return {
		prompt: getPromptText(element),
		attributes: element.customAttributes ?? {},
	};
}
