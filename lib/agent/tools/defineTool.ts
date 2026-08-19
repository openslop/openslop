import type { Tool } from "ai";
import type { z } from "zod";
import type { AgentToolContext } from "./context";

/**
 * One tool, whole: the spec the model is offered and the executor the editor
 * runs. Specs declare no execute of their own because every tool runs against
 * the Slate canvas in the browser: the SDK surfaces the call, the editor
 * answers it, and the result comes back as the next request.
 */
export function defineTool<Input, Output>(def: {
	description: string;
	input: z.ZodType<Input>;
	output: z.ZodType<Output>;
	toModelOutput?: Tool<Input, Output>["toModelOutput"];
	execute: (input: Input, ctx: AgentToolContext) => Promise<Output>;
}) {
	const { input, output, execute, ...rest } = def;
	// Tool's shape is conditional on OUTPUT, which never resolves against a
	// generic; the def parameter above already checks every field against it.
	const spec = {
		...rest,
		inputSchema: input,
		outputSchema: output,
	} as unknown as Tool<Input, Output>;
	return { input, execute, spec };
}

/** A tool-result image, handed to the model by URL for the provider to fetch. */
export const imagePart = (url: string) => ({
	type: "file" as const,
	mediaType: "image",
	data: { type: "url" as const, url: new URL(url) },
});
