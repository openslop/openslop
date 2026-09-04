import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
} from "@/lib/connectors/types";
import type { ProviderContract } from "../base";
import type { AgentModel } from "./agentModel";

export interface LLMProvider extends ProviderContract {
	generate(params: LLMGenerateParams): Promise<LLMGenerateResult>;
	stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk>;
	agentModel(model: string): AgentModel;
}
