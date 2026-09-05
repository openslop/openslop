import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
} from "@/lib/connectors/types";
import type { VendorParams } from "@/lib/connectors/models";
import type { ProviderContract } from "../base";
import type { AgentModel } from "./agentModel";

export type LLMRequest = VendorParams<LLMGenerateParams>;

export interface LLMProvider extends ProviderContract {
	generate(params: LLMRequest): Promise<LLMGenerateResult>;
	stream(params: LLMRequest): AsyncGenerator<LLMStreamChunk>;
	agentModel(model: string): AgentModel;
}
