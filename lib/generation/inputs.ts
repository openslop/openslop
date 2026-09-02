import { Node } from "slate";
import { z } from "zod";
import { withoutCaretMarker } from "@/lib/canvas/constants";
import type { CanvasContentElement } from "@/lib/canvas/types";

/** What the user authored on the element. Project state arrives via dependencies. */
const NodeInputsSchema = z.object({
	prompt: z.string(),
	attributes: z.record(z.string(), z.union([z.string(), z.number()])),
});

export type NodeInputs = z.infer<typeof NodeInputsSchema>;

/** `NodeInputs` plus the identity each dependency resolved to. */
export const GenerationInputsSchema = NodeInputsSchema.extend({
	dependencies: z.record(z.string(), z.string()),
});

export type GenerationInputs = z.infer<typeof GenerationInputsSchema>;

const sortedEntries = (record: Record<string, string | number>) =>
	Object.fromEntries(
		Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
	);

export function serializeInputs(inputs: GenerationInputs): string {
	return JSON.stringify({
		prompt: inputs.prompt,
		attributes: sortedEntries(inputs.attributes),
		dependencies: sortedEntries(inputs.dependencies),
	});
}

export function getPromptText(element: CanvasContentElement): string {
	return withoutCaretMarker(Node.string(element)).trim();
}
