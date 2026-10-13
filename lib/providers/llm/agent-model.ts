import type { SharedV3ProviderOptions } from "@ai-sdk/provider";
import type { LanguageModel, LanguageModelUsage } from "ai";

/** How an LLM provider exposes itself to Sloppy: a model plus its vendor knobs. */
export type AgentModel = {
	model: LanguageModel;
	modelId: string;
	providerOptions: SharedV3ProviderOptions;
	/** Marks a system message the provider keeps between requests. */
	cachedPrefix: SharedV3ProviderOptions;
	costOf(usage: LanguageModelUsage): number;
};
