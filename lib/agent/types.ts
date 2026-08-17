import { z } from "zod";
import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import { SLOPPY_TOOLS } from "./tools/specs";

const agentUsageSchema = z.object({
	inputTokens: z.number(),
	outputTokens: z.number(),
	/** Every step of the turn, end to end. Excludes the edits, which the client runs. */
	workSeconds: z.number().optional(),
});
export type AgentUsage = z.infer<typeof agentUsageSchema>;

const agentRequestSchema = z.object({
	system: z.string(),
	model: z.string(),
});
export type AgentRequestRecord = z.infer<typeof agentRequestSchema>;

/** Carried on the message, so one turn stays one row however many steps it took. */
export const sloppyMetadataSchema = z.object({
	request: agentRequestSchema.optional(),
	usage: agentUsageSchema.optional(),
});
export type SloppyMetadata = z.infer<typeof sloppyMetadataSchema>;

export type SloppyTools = InferUITools<typeof SLOPPY_TOOLS>;

/** The transcript's message, in the one shape both the panel and storage take. */
export type SloppyMessage = UIMessage<SloppyMetadata, UIDataTypes, SloppyTools>;
