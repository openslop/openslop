import type { z } from "zod";
import type { RefineOp } from "@/lib/script/refine/types";
import type { AgentToolSpec } from "./specs";

/**
 * What a tool can do to the canvas: verbs, never the parts they are built from,
 * so a tool never learns that the canvas is a Slate editor.
 */
export type AgentToolContext = {
	editScript: (ops: RefineOp[]) => { applied: number; failures: string[] };
	writeScript: (brief: string) => Promise<void>;
};

export type AgentTool = AgentToolSpec & {
	/** Returns the one-line outcome recorded as the tool result. */
	execute: (input: unknown, ctx: AgentToolContext) => Promise<string>;
};

export function defineTool<TSchema extends z.ZodType>(
	spec: AgentToolSpec<TSchema>,
	execute: (input: z.infer<TSchema>, ctx: AgentToolContext) => Promise<string>,
): AgentTool {
	return {
		...spec,
		execute: (input, ctx) => execute(spec.inputSchema.parse(input), ctx),
	};
}
