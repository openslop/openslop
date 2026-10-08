import { Node } from "slate";
import { z } from "zod";
import { withoutCaretMarker } from "@/lib/canvas/constants";
import type { CanvasElement } from "@/lib/canvas/types";

const NodeInputsSchema = z.object({
	prompt: z.string(),
	attributes: z.record(z.string(), z.union([z.string(), z.number()])),
	reads: z.record(z.string(), z.string()),
});

export type NodeInputs = z.infer<typeof NodeInputsSchema>;

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
		reads: sortedEntries(inputs.reads),
		dependencies: sortedEntries(inputs.dependencies),
	});
}

export function getPromptText(element: CanvasElement): string {
	return withoutCaretMarker(Node.string(element)).trim();
}
