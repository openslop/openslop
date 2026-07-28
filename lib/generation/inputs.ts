import { Node } from "slate";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import type { CanvasContentElement } from "@/lib/canvas/types";

/** What the user authored on the element. Project state arrives via dependencies. */
export type NodeInputs = {
	prompt: string;
	attributes: Record<string, string | number>;
};

/** `NodeInputs` plus the identity each dependency resolved to. */
export type GenerationInputs = NodeInputs & {
	dependencies: Record<string, string>;
};

const sortedEntries = (record: Record<string, string | number>) =>
	Object.fromEntries(
		Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
	);

export function serializeNodeInputs(inputs: NodeInputs): string {
	return JSON.stringify({
		prompt: inputs.prompt,
		attributes: sortedEntries(inputs.attributes),
	});
}

export function serializeInputs(inputs: GenerationInputs): string {
	return JSON.stringify({
		prompt: inputs.prompt,
		attributes: sortedEntries(inputs.attributes),
		dependencies: sortedEntries(inputs.dependencies),
	});
}

export function getPromptText(element: CanvasContentElement): string {
	return Node.string(element).replaceAll(ZERO_WIDTH_SPACE, "").trim();
}
