import { ApiClient } from "@/lib/clients/apiClient";
import { readSSE } from "@/lib/api/sse";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { AssetGateway, GatewayClient } from "./base";
import type { JobPoll, JobSubmission } from "./base";

/**
 * Gateways that reach a provider through one of our own API prefixes. The
 * prefix is the seam: `/api/v1` serves the models OpenSlop hosts, and the
 * third-party prefix serves the ones a user brings their own key for. Every
 * route under a prefix speaks the same protocol, so a gateway family is only
 * the prefix its connectors post to.
 */
export abstract class HttpGatewayClient<
	TParams = unknown,
	TResult = unknown,
> extends GatewayClient<TParams, TResult> {
	protected client: ApiClient;
	protected abstract readonly apiPrefix: string;

	constructor(baseUrl?: string) {
		super();
		this.client = new ApiClient(baseUrl);
	}
}

export abstract class HttpAssetGateway<TParams> extends AssetGateway<TParams> {
	protected client: ApiClient;
	protected abstract readonly apiPrefix: string;
	protected abstract readonly path: string;

	constructor(baseUrl?: string) {
		super();
		this.client = new ApiClient(baseUrl);
	}

	async generate(params: TParams): Promise<JobSubmission> {
		return this.client.post<JobSubmission>(
			`${this.apiPrefix}/${this.path}`,
			params,
		);
	}

	async poll(jobId: string): Promise<JobPoll> {
		return this.client.get<JobPoll>(`${this.apiPrefix}/${this.path}/${jobId}`);
	}
}

/** Text runs in the request rather than as a job, and may stream. */
export abstract class HttpLLMGateway extends HttpGatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
		return this.client.post(`${this.apiPrefix}/llm`, params);
	}

	async *stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		const res = await this.client.postStream(
			`${this.apiPrefix}/llm`,
			{ ...params, stream: true },
			signal,
		);
		if (!res.body) throw new Error("No response body");
		yield* readSSE<LLMStreamChunk>(res.body);
	}
}

export abstract class HttpTTSGateway extends HttpAssetGateway<TTSGenerateParams> {
	protected readonly path = "tts";

	/** What the voice search is scoped by, beyond the search itself. */
	protected voiceQuery(params: VoiceSearchParams): Record<string, string> {
		return params as Record<string, string>;
	}

	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const result = await this.client.get<{ voices: VoiceInfo[] }>(
			`${this.apiPrefix}/tts/voices`,
			this.voiceQuery(params),
		);
		return result.voices;
	}
}
