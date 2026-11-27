import { z } from "zod";
import type { LLM_MODELS } from "@/lib/connectors/llm/models";
import { LOCAL_PROVIDER } from "@/lib/connectors/provider-catalog";

export const LOCAL_CLAUDE_MODEL =
	"Claude subscription" satisfies keyof (typeof LLM_MODELS)[typeof LOCAL_PROVIDER];

export const LocalClaudeModelSchema = z.object({
	provider: z.literal(LOCAL_PROVIDER),
	model: z.literal(LOCAL_CLAUDE_MODEL),
});

export const ClaudeAccountSchema = z.object({
	installed: z.boolean(),
	loginUrl: z.url().optional(),
	loginError: z.string().optional(),
	connected: z.boolean(),
	email: z.string().optional(),
	subscription: z.string().optional(),
});
