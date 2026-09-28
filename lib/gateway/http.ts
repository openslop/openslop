import { apiFetch, apiJson } from "@/lib/clients/http";
import { readSSE } from "@/lib/api/sse";
import type {
	HostedVoicePreview,
	LLMGenerateParams,
	LLMGenerateResult,
	LLMStreamChunk,
	ModelRef,
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
 * which one to post to is the model's provider's decision, not a subclass's.
 */
export class HttpAssetGateway<TParams> extends AssetGateway<TParams> {
	protected readonly route: string;

	constructor(
		protected readonly model: ModelRef,
		path: string,
	) {
		super();
		this.route = `${apiPrefixFor(model.provider)}/${path}`;
	}

	async generate(params: TParams): Promise<JobSubmission> {
		return apiJson<JobSubmission>(this.route, { method: "POST", body: params });
	}

	async poll(jobId: string, signal?: AbortSignal): Promise<JobPoll> {
		return apiJson<JobPoll>(`${this.route}/${jobId}`, { signal });
	}
}

/** Text runs in the request rather than as a job, and may stream. */
export class HttpLLMGateway extends GatewayClient<
	LLMGenerateParams,
	LLMGenerateResult
> {
	private readonly route: string;

	constructor(model: ModelRef) {
		super();
		this.route = `${apiPrefixFor(model.provider)}/llm`;
	}

	async generate(params: LLMGenerateParams): Promise<LLMGenerateResult> {
		return apiJson(this.route, { method: "POST", body: params });
	}

	async *stream(
		params: LLMGenerateParams,
		signal?: AbortSignal,
	): AsyncGenerator<LLMStreamChunk> {
		const res = await apiFetch(this.route, {
			method: "POST",
			body: { ...params, stream: true },
			signal,
		});
		if (!res.body) throw new Error("No response body");
		yield* readSSE<LLMStreamChunk>(res.body);
	}
}

export class HttpTTSGateway extends HttpAssetGateway<TTSGenerateParams> {
	constructor(model: ModelRef) {
		super(model, "tts");
	}

	/** A voice search names its model like a generation does, so the route knows whose key to read. */
	async searchVoices(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const result = await apiJson<{ voices: VoiceInfo[] }>(
			`${this.route}/voices`,
			{ params: { ...params, ...this.model } },
		);
		return result.voices;
	}

	async voicePreview(voiceId: string): Promise<HostedVoicePreview | undefined> {
		const { preview } = await apiJson<{ preview?: HostedVoicePreview }>(
			`${this.route}/voices/preview`,
			{ params: { voiceId, ...this.model } },
		);
		return preview;
	}
}
