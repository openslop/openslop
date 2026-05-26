import omit from "lodash/omit";
import type { GenerationInputs } from "@/lib/generation/queue";
import type { Metadata } from "@/lib/project/types";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import type { CanvasContentElement } from "../types";
import { INPUT_CONTRIBUTORS } from "./inputContributors";
import { getPromptText } from "./getPromptText";

export function getGenerationInputs(
	element: CanvasContentElement,
	metadata: Metadata,
): GenerationInputs {
	const attributes: Record<string, string> = omit(
		element.customAttributes ?? {},
		LAYOUT_ATTRIBUTE_KEYS,
	);
	for (const contributor of INPUT_CONTRIBUTORS) {
		if (contributor.appliesTo && !contributor.appliesTo.includes(element.type))
			continue;
		for (const [key, value] of Object.entries(
			contributor.derive(element, metadata),
		)) {
			if (value !== undefined) attributes[key] = value;
		}
	}
	return { prompt: getPromptText(element), attributes };
}
