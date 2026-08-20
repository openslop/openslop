import { BaseLLMConnector } from "../connector";
import { OpenSlopLLMGateway } from "@/lib/gateway/openslop/llm";
import type {
	ConnectorConfig,
	LLMGenerateParams,
	LLMStreamChunk,
} from "@/lib/connectors/types";

export class OpenSlopLLM extends BaseLLMConnector<OpenSlopLLMGateway> {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopLLMGateway(config.baseUrl), config);
	}

	protected async *_stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		yield* this.gateway.stream(params, signal);
	}
}
