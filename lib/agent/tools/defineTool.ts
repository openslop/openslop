import type { z } from "zod";
import type { Editor } from "slate";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { AgentToolSpec } from "./specs";

/**
 * What a tool is allowed to touch. Every tool runs on the client, because the
 * canvas lives in a Slate editor there and the client is the only writer.
 */
export type AgentToolContext = {
	editor: Editor;
	connectors: ConnectorRegistry;
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
