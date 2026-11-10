import { HttpLLMGateway } from "@/lib/gateway/http";
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
		this.gateway = new HttpLLMGateway(config);
	}

	protected async _generate(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): Promise<LLMGenerateResult> {
		return this.gateway.generate(params, signal);
	}

	async *stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		try {
			const prepared = await this.prepareParams(params, {});
			yield* this.gateway.stream(prepared, signal);
		} catch (error) {
			await runOnError(this.plugins, error, {});
			throw error;
		}
	}
}
