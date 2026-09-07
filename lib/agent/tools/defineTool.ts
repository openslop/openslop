import type { Tool } from "ai";
import type { z } from "zod";
import type { IconComponent } from "@/components/ui/icon";
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
	icon: IconComponent;
	/** What the transcript calls the running step. Input arrives as the SDK streams it. */
	label: string | ((input: Partial<Input>) => string);
	toModelOutput?: Tool<Input, Output>["toModelOutput"];
	execute: (input: Input, ctx: AgentToolContext) => Promise<Output>;
	/** Output that is only true until the next edit, so only its own turn keeps it. */
	snapshot?: true;
	/** The call rewrites the canvas, so what is rendered from it is mid-change. */
	rewritesCanvas?: true;
}) {
	const {
		input,
		output,
		execute,
		snapshot,
		rewritesCanvas,
		icon,
		label,
		...rest
	} = def;
	// Tool's shape is conditional on OUTPUT, which never resolves against a
	// generic; the def parameter above already checks every field against it.
	const spec = {
		...rest,
		inputSchema: input,
		outputSchema: output,
	} as unknown as Tool<Input, Output>;
	const present = {
		icon,
		label: typeof label === "function" ? label : () => label,
	};
	return { input, execute, spec, snapshot, rewritesCanvas, present };
}

/** A tool-result image, handed to the model by URL for the provider to fetch. */
const imagePart = (url: string) => ({
	type: "file" as const,
	mediaType: "image",
	data: { type: "url" as const, url: new URL(url) },
});

/** What a look-at tool hands back: what the model is about to see, then the images. */
export const imageOutput = (text: string, ...urls: string[]) => ({
	type: "content" as const,
	value: [{ type: "text" as const, text }, ...urls.map(imagePart)],
});

export const seconds = (value: number) => `${value.toFixed(1)}s`;
