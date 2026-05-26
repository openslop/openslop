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
			const prepared = await this.prepareParams(params, ctx);
			yield* this._stream(prepared);
		} catch (error) {
			await this.reportError(ctx, error);
		}
	}

	protected abstract _stream(
		params: LLMGenerateParams,
	): AsyncGenerator<LLMStreamChunk>;
}
