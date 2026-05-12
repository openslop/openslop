import omit from "lodash/omit";
import type { GenerationInputs } from "@/lib/generation/queue";
import type { CanvasContentElement } from "../types";
import { getPromptText } from "./getPromptText";

const NON_GENERATION_ATTRIBUTES = ["loops", "volume"] as const;

export function getGenerationInputs(
	element: CanvasContentElement,
): GenerationInputs {
	return {
		prompt: getPromptText(element),
		attributes: omit(element.customAttributes ?? {}, NON_GENERATION_ATTRIBUTES),
	};
}
