import { BaseLLMConnector } from "../connector";
import { ThirdPartyLLMGateway } from "@/lib/gateway/thirdparty/llm";
import type {
	ConnectorConfig,
	LLMGenerateParams,
	LLMStreamChunk,
} from "@/lib/connectors/types";

/**
 * Text on a model the user brings their own key for. One class serves every
 * such vendor: the model names which one, and the third-party routes resolve
 * the key from the account making the request.
 */
export class ThirdPartyLLM extends BaseLLMConnector<ThirdPartyLLMGateway> {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartyLLMGateway(config.baseUrl), config);
	}

	protected async *_stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		yield* this.gateway.stream(params, signal);
	}
}
