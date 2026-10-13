import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
} from "@/lib/connectors/types";
import type { VendorParams } from "@/lib/connectors/models";
import type { Priced, ProviderContract } from "../base";
import type { AgentModel } from "./agent-model";

export type LLMRequest = VendorParams<LLMGenerateParams>;

export interface LLMProvider extends ProviderContract {
	generate(params: LLMRequest): Promise<Priced<LLMGenerateResult>>;
	/** Returns what the generation cost once its last chunk is through. */
	stream(params: LLMRequest): AsyncGenerator<LLMStreamChunk, number>;
	agentModel(modelId: string): AgentModel;
}
