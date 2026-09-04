import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import type { ProviderContract } from "../base";
import type { AgentModel } from "./agentModel";

export interface LLMProvider extends ProviderContract {
	generate(params: LLMGenerateParams): Promise<LLMGenerateResult>;
	stream(
		params: LLMGenerateParams,
	): AsyncGenerator<{ text: string; done: boolean }>;
	agentModel(model?: string): AgentModel;
}
