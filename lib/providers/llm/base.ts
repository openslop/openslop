import type {
	LLMGenerateParams,
	LLMGenerateResult,
} from "@/lib/connectors/types";
import type { Provider } from "../base";
import type { AgentModel } from "./agentModel";

export interface LLMProvider extends Provider {
	generate(params: LLMGenerateParams): Promise<LLMGenerateResult>;
	stream(
		params: LLMGenerateParams,
	): AsyncGenerator<{ text: string; done: boolean }>;
	agentModel(model?: string): AgentModel;
}
