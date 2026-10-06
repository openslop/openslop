import { Node } from "slate";
import { z } from "zod";
import { withoutCaretMarker } from "@/lib/canvas/constants";
import type { ScriptElement } from "@/lib/canvas/types";

/** What a node generates from, apart from the results of its dependencies. */
const NodeInputsSchema = z.object({
	prompt: z.string(),
	attributes: z.record(z.string(), z.union([z.string(), z.number()])),
	/** What its plugins read off the canvas and the settings, keyed by how the user names it. */
	reads: z.record(z.string(), z.string()),
});

export type NodeInputs = z.infer<typeof NodeInputsSchema>;

/** `NodeInputs` plus the identity each dependency resolved to, keyed by its label. */
export const GenerationInputsSchema = NodeInputsSchema.extend({
	dependencies: z.record(z.string(), z.string()).default({}),
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

export function getPromptText(element: ScriptElement): string {
	return withoutCaretMarker(Node.string(element)).trim();
}
