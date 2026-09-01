import { ApiClient } from "@/lib/clients/apiClient";
import { readSSE } from "@/lib/api/sse";
import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
	ProviderKey,
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { AssetGateway, GatewayClient } from "./base";
import type { JobPoll, JobSubmission } from "./base";
import { apiPrefixFor } from "./prefix";

/**
 * A generation reached through one of our own API prefixes: `/api/v1` serves
 * the models OpenSlop hosts, and the third-party prefix serves the ones a user
 * brings a key for. Every route under a prefix speaks the same protocol, so
 * which one to post to is the provider's decision, not a subclass's.
 */
export class HttpAssetGateway<TParams> extends AssetGateway<TParams> {
	protected readonly client: ApiClient;
	protected readonly route: string;

	constructor(provider: ProviderKey, path: string, baseUrl?: string) {
		super();
		this.client = new ApiClient(baseUrl);
		this.route = `${apiPrefixFor(provider)}/${path}`;
	}

	async generate(params: TParams): Promise<JobSubmission> {
		return this.client.post<JobSubmission>(this.route, params);
	}

	async poll(jobId: string): Promise<JobPoll> {
		return this.client.get<JobPoll>(`${this.route}/${jobId}`);
	}
}

/** Text runs in the request rather than as a job, and may stream. */
export class HttpLLMGateway extends GatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	private readonly client: ApiClient;
	private readonly route: string;

	constructor(provider: ProviderKey, baseUrl?: string) {
		super();
		this.client = new ApiClient(baseUrl);
		this.route = `${apiPrefixFor(provider)}/llm`;
	}

	async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
		return this.client.post(this.route, params);
	}

	async *stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		const res = await this.client.postStream(
			this.route,
			{ ...params, stream: true },
			signal,
		);
		if (!res.body) throw new Error("No response body");
		yield* readSSE<LLMStreamChunk>(res.body);
	}
}

export class HttpTTSGateway extends HttpAssetGateway<TTSGenerateParams> {
	constructor(
		private readonly provider: ProviderKey,
		baseUrl?: string,
	) {
		super(provider, "tts", baseUrl);
	}

	/**
	 * A third-party voice search names its provider: unlike a generation it
	 * carries no model to resolve one from, and the route has to know whose key
	 * to read. The hosted route reads only its own.
	 */
	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const query = {
			...params,
			...(this.provider !== MANAGED_PROVIDER && { provider: this.provider }),
		} as Record<string, string>;
		const result = await this.client.get<{ voices: VoiceInfo[] }>(
			`${this.route}/voices`,
			query,
		);
		return result.voices;
	}
}
