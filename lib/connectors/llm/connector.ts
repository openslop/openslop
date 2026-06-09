import type { GatewayClient } from "@/lib/gateway/base";
import { BaseConnector } from "../base";
import type {
	ConnectorConfig,
	LLMConnector,
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
} from "../types";

export abstract class BaseLLMConnector<
	TGateway extends GatewayClient<LLMGenerateParams, LLMGenerateResult> =
		GatewayClient<LLMGenerateParams, LLMGenerateResult>,
>
	extends BaseConnector<LLMGenerateParams, LLMGenerateResult>
	implements LLMConnector
{
	readonly type = "llm" as const;
	protected gateway: TGateway;

	constructor(gateway: TGateway, config: ConnectorConfig) {
		super(config);
		this.gateway = gateway;
	}

	protected pluginContext() {
		return { gateway: this.gateway };
	}

	protected async _generate(
		params: LLMGenerateParams,
	): Promise<LLMGenerateResult> {
		return this.gateway.generate(params);
	}

	async *stream(params: LLMGenerateParams): AsyncGenerator<LLMStreamChunk> {
		const ctx = this.pluginContext();
		try {
			yield* this._stream(await this.prepareParams(params, ctx));
		} catch (error) {
			await this.reportError(error, ctx);
			throw error;
		}
	}

	protected abstract _stream(
		params: LLMGenerateParams,
	): AsyncGenerator<LLMStreamChunk>;
}
