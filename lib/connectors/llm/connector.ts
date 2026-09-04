import { HttpLLMGateway } from "@/lib/gateway/http";
import { stringifyError } from "@/lib/errors";
import { BaseConnector } from "../base";
import { runOnError } from "../plugins";
import type {
	LLMConnector,
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
	ResolvedConnectorConfig,
} from "../types";

export class HttpLLMConnector
	extends BaseConnector<LLMGenerateParams, LLMGenerateResult>
	implements LLMConnector
{
	readonly type = "llm" as const;
	private gateway: HttpLLMGateway;

	constructor(config: ResolvedConnectorConfig) {
		super(config);
		this.gateway = new HttpLLMGateway(config.model, config.baseUrl);
	}

	protected pluginContext() {
		return { gateway: this.gateway };
	}

	protected async _generate(
		params: LLMGenerateParams,
	): Promise<LLMGenerateResult> {
		return this.gateway.generate(params);
	}

	async *stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		const ctx = this.pluginContext();
		try {
			const prepared = await this.prepareParams(params, ctx);
			yield* this.gateway.stream(prepared, signal);
		} catch (error) {
			await runOnError(this.plugins, stringifyError(error), ctx);
			throw error;
		}
	}
}
