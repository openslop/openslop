import type { Caption } from "@remotion/captions";
import { unstable_cache } from "next/cache";
import Cartesia from "@cartesia/cartesia-js";
import type { VoiceInfo, VoiceSearchParams } from "@/lib/connectors/types";
import {
	DEFAULT_TTS_EMOTION,
	DEFAULT_TTS_SPEED,
	TTS_GENDERS,
	type TTSSpeed,
} from "@/lib/connectors/tts/enums";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { logger } from "@/lib/api/logger";
import { BaseProvider, type RawResult } from "../base";
import { timestampsFile } from "../timestamps-file";
import { trimmedWords, type TimedToken } from "@/lib/captions/word-captions";
import { validateCartesiaKey } from "../cartesia";
import { pcmDurationSec, pcmSilence, wavFromPcm, type PcmFormat } from "../wav";
import type { TTSProvider, TTSRequest } from "./base";
import { fetchAllowedVoicePreview } from "./voice-preview";
import { buildQueryText, rankBySimilarity } from "./voice-similarity";
import type {
	GenerationRequest,
	RawEncoding,
} from "@cartesia/cartesia-js/resources/tts.mjs";
import type {
	Voice,
	VoiceListParams,
} from "@cartesia/cartesia-js/resources/voices.mjs";

type RawTTSResult = {
	data: Buffer;
	textTimestamps: Caption[];
} & RawResult;

/** Cartesia reports no per-request cost; the Scale plan is $299 for 8M characters. */
const USD_PER_CHARACTER = 299 / 8_000_000;

const SAMPLE_RATE = 44100;
const ENCODING: RawEncoding = "pcm_f32le";
const CARTESIA_VOLUME = 1.0;

const CARTESIA_SPEED: Record<TTSSpeed, number> = {
	slow: 0.6,
	medium: 1.0,
	fast: 1.5,
};

const PCM_WAV_PARAMS: Record<
	RawEncoding,
	Pick<PcmFormat, "audioFormat" | "bitsPerSample">
> = {
	pcm_f32le: { audioFormat: 3, bitsPerSample: 32 },
	pcm_s16le: { audioFormat: 1, bitsPerSample: 16 },
	pcm_mulaw: { audioFormat: 7, bitsPerSample: 8 },
	pcm_alaw: { audioFormat: 6, bitsPerSample: 8 },
};

const STREAMED_FORMAT: PcmFormat = {
	...PCM_WAV_PARAMS[ENCODING],
	sampleRate: SAMPLE_RATE,
	channels: 1,
};

/** Silence after each line, so back-to-back lines sound natural. */
const TRAILING_PAUSE_SEC = 1;

const PREVIEW_HOST = "files.cartesia.ai";
const PAGE_SIZE = 100;
const MAX_VOICES = 1000;

type VoiceListPage = {
	data: Voice[];
	has_more: boolean;
	next_page: string | null;
};

type VoiceQueryParams = Omit<
	VoiceListParams,
	"limit" | "starting_after" | "ending_before"
> & {
	language?: string;
};

export async function collectVoices(
	client: Cartesia,
	params: VoiceQueryParams,
	limit: number,
): Promise<Voice[]> {
	const voices: Voice[] = [];
	let cursor: string | undefined;
	while (voices.length < limit) {
		const page = await client.get<VoiceListPage>("/voices", {
			query: { ...params, limit: PAGE_SIZE, starting_after: cursor },
		});
		voices.push(...page.data);
		if (!page.has_more || !page.next_page) break;
		cursor = page.next_page;
	}
	return voices;
}

const collectVoicesCached = unstable_cache(
	(apiKey: string, params: VoiceQueryParams, limit: number): Promise<Voice[]> =>
		collectVoices(new Cartesia({ apiKey }), params, limit),
	["cartesia-voices"],
	{ revalidate: 3600 },
);

const toVoiceInfo = (voice: Voice): VoiceInfo => ({
	id: voice.id,
	name: voice.name,
	language: voice.language,
	gender: TTS_GENDERS.find((gender) => gender === voice.gender),
	description: voice.description,
	previewUrl: voice.preview_file_url ?? undefined,
});

export class CartesiaTTS
	extends BaseProvider<TTSRequest, RawTTSResult>
	implements TTSProvider
{
	protected readonly blobConfig = { type: "tts", provider: "cartesia" };
	private readonly client: Cartesia;

	constructor(private readonly apiKey: string) {
		super();
		this.client = new Cartesia({ apiKey });
	}

	async validate() {
		return validateCartesiaKey(this.apiKey);
	}

	async fetchVoicePreview(url: string): Promise<Response> {
		return fetchAllowedVoicePreview(url, PREVIEW_HOST, {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});
	}

	protected toFiles(result: RawTTSResult): BundleFile[] {
		return [
			{
				key: "audio",
				filename: "output.wav",
				data: result.data,
				contentType: "audio/wav",
			},
			timestampsFile(result.textTimestamps),
		];
	}

	async getVoice(voiceId: string): Promise<VoiceInfo | null> {
		try {
			const voice = await this.client.get<Voice>(
				`/voices/${encodeURIComponent(voiceId)}`,
				{ query: { expand: ["preview_file_url"] } },
			);
			return toVoiceInfo(voice);
		} catch (error) {
			if (error instanceof Cartesia.NotFoundError) return null;
			throw error;
		}
	}

	async search(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const voices = await this.listVoices(params);
		const queryText = buildQueryText(params);
		const ranked = queryText
			? await rankBySimilarity(voices, queryText).catch((err) => {
					logger.warn(
						{ err },
						"Voice similarity ranking failed; returning unranked results",
					);
					return voices;
				})
			: voices;
		return ranked.slice(0, params.limit || ranked.length);
	}

	private async listVoices({
		gender,
		language,
	}: VoiceSearchParams): Promise<VoiceInfo[]> {
		const voices = await collectVoicesCached(
			this.apiKey,
			{ gender, language, expand: ["preview_file_url"] },
			MAX_VOICES,
		);
		return voices.map(toVoiceInfo);
	}

	protected async _generate(params: TTSRequest) {
		const socket = await this.client.tts.websocket();
		await socket.connect();

		try {
			const audioChunks: Buffer[] = [];
			const tokens: TimedToken[] = [];
			const request: GenerationRequest = {
				model_id: params.model,
				transcript: params.prompt,
				voice: { mode: "id", id: params.voiceId },
				output_format: {
					container: "raw",
					encoding: ENCODING,
					sample_rate: SAMPLE_RATE,
				},
				add_timestamps: true,
				generation_config: {
					speed: CARTESIA_SPEED[params.speed ?? DEFAULT_TTS_SPEED],
					volume: CARTESIA_VOLUME,
					emotion: params.emotion || DEFAULT_TTS_EMOTION,
				},
			};
			for await (const response of socket.generate(request)) {
				if (response.type === "chunk" && response.audio) {
					audioChunks.push(response.audio);
				}
				if (response.type === "timestamps" && response.word_timestamps) {
					const { words, start, end } = response.word_timestamps;
					tokens.push(
						...words.map((text, i) => ({ text, start: start[i], end: end[i] })),
					);
				}
			}

			const pcm = Buffer.concat(audioChunks);
			if (pcm.length === 0) {
				throw new Error(
					`Cartesia returned no audio for voice ${params.voiceId}`,
				);
			}

			const padded = Buffer.concat([
				pcm,
				pcmSilence(TRAILING_PAUSE_SEC, STREAMED_FORMAT),
			]);
			return {
				data: wavFromPcm(padded, STREAMED_FORMAT),
				textTimestamps: trimmedWords(tokens),
				costUsd: params.prompt.length * USD_PER_CHARACTER,
				// Word timestamps stop at the last word, and may be absent.
				metadata: {
					durationSec: pcmDurationSec(padded.length, STREAMED_FORMAT),
				},
			};
		} finally {
			socket.close();
		}
	}
}
