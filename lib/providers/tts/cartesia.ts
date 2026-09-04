import { unstable_cache } from "next/cache";
import Cartesia from "@cartesia/cartesia-js";
import type {
	TextTimestamp,
	TTSGenerateParams,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import {
	TTS_GENDERS,
	type TTSGender,
	type TTSSpeed,
} from "@/lib/connectors/tts/enums";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { logger } from "@/lib/api/logger";
import { BaseProvider, type WithMetadata } from "../base";
import { fromStatus, probe } from "../validate";
import type { TTSProvider } from "./base";
import { fetchAllowedVoicePreview } from "./voicePreview";
import { buildQueryText, rankBySimilarity } from "./voiceSimilarity";
import { GenerationRequest } from "@cartesia/cartesia-js/resources/tts.mjs";
import type {
	Voice,
	VoiceListParams,
} from "@cartesia/cartesia-js/resources/voices.mjs";

type RawTTSResult = {
	data: string;
	textTimestamps: TextTimestamp[];
} & WithMetadata;

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 1;
const ENCODING = "pcm_f32le";
const CARTESIA_VOLUME = 1.0;

const CARTESIA_SPEED: Record<TTSSpeed, number> = {
	slow: 0.6,
	medium: 1.0,
	fast: 1.5,
};

const PCM_WAV_PARAMS: Record<
	string,
	{ audioFormat: number; bitsPerSample: number }
> = {
	pcm_f32le: { audioFormat: 3, bitsPerSample: 32 },
	pcm_s16le: { audioFormat: 1, bitsPerSample: 16 },
	pcm_mulaw: { audioFormat: 7, bitsPerSample: 8 },
	pcm_alaw: { audioFormat: 6, bitsPerSample: 8 },
};

const { audioFormat: AUDIO_FORMAT, bitsPerSample: BITS_PER_SAMPLE } =
	PCM_WAV_PARAMS[ENCODING];
const BLOCK_ALIGN = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
const BYTE_RATE = SAMPLE_RATE * BLOCK_ALIGN;

/**
 * Duration of the raw PCM Cartesia streamed back. Word timestamps can't stand in
 * for it: they stop at the last word, and are absent entirely when the model
 * emits no timestamp frames.
 */
export function pcmDurationSec(byteLength: number): number {
	return byteLength / BYTE_RATE;
}

function wrapPcmInWav(pcm: Buffer): Buffer {
	const header = Buffer.alloc(44);

	header.write("RIFF", 0);
	header.writeUInt32LE(36 + pcm.length, 4);
	header.write("WAVE", 8);
	header.write("fmt ", 12);
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(AUDIO_FORMAT, 20);
	header.writeUInt16LE(NUM_CHANNELS, 22);
	header.writeUInt32LE(SAMPLE_RATE, 24);
	header.writeUInt32LE(BYTE_RATE, 28);
	header.writeUInt16LE(BLOCK_ALIGN, 32);
	header.writeUInt16LE(BITS_PER_SAMPLE, 34);
	header.write("data", 36);
	header.writeUInt32LE(pcm.length, 40);

	return Buffer.concat([header, pcm]);
}

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

export class CartesiaTTS
	extends BaseProvider<TTSGenerateParams, RawTTSResult>
	implements TTSProvider
{
	protected readonly blobConfig = { type: "tts", provider: "cartesia" };
	private client: Cartesia;
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
		this.client = new Cartesia({ apiKey });
	}

	/** Listing one voice is the cheapest call the API authenticates. */
	async validate() {
		return fromStatus(
			await probe("https://api.cartesia.ai/voices/?limit=1", {
				headers: {
					"X-API-Key": this.apiKey,
					"Cartesia-Version": "2024-11-13",
				},
			}),
		);
	}

	async fetchVoicePreview(url: string): Promise<Response> {
		return fetchAllowedVoicePreview(url, PREVIEW_HOST, {
			headers: { Authorization: `Bearer ${this.apiKey}` },
		});
	}

	protected toFiles(r: RawTTSResult): BundleFile[] {
		return [
			{
				key: "audio",
				filename: "output.wav",
				data: Buffer.from(r.data, "base64"),
				contentType: "audio/wav",
			},
			{
				key: "timestamps",
				filename: "timestamps.json",
				data: JSON.stringify(r.textTimestamps),
				contentType: "application/json",
			},
		];
	}

	async search(params: VoiceSearchParams): Promise<VoiceInfo[]> {
		const { gender, limit, language } = params;
		const results = await this._search(gender, language);
		const queryText = buildQueryText(params);
		const ranked = queryText
			? await rankBySimilarity(results, queryText).catch((err) => {
					logger.warn(
						{ err },
						"Voice similarity ranking failed; returning unranked results",
					);
					return results;
				})
			: results;
		return ranked.slice(0, limit || ranked.length);
	}

	private async _search(
		gender?: TTSGender,
		language?: string,
	): Promise<VoiceInfo[]> {
		const voices = await collectVoicesCached(
			this.apiKey,
			{ gender, language, expand: ["preview_file_url"] },
			MAX_VOICES,
		);
		return voices.map((voice) => ({
			id: voice.id,
			name: voice.name,
			language: voice.language,
			gender: TTS_GENDERS.find((g) => g === voice.gender),
			description: voice.description,
			previewUrl: voice.preview_file_url ?? undefined,
		}));
	}

	protected async _generate(params: TTSGenerateParams) {
		if (!params.voiceId) throw new Error("voiceId is required");
		const ws = await this.client.tts.websocket();
		await ws.connect();

		try {
			const audioChunks: Buffer[] = [];
			const textTimestamps: TextTimestamp[] = [];
			const req: GenerationRequest = {
				model_id: params.model || "sonic-3.5",
				transcript: params.prompt,
				voice: { mode: "id", id: params.voiceId },
				output_format: {
					container: "raw",
					encoding: ENCODING,
					sample_rate: SAMPLE_RATE,
				},
				add_timestamps: true,
				generation_config: {
					speed: CARTESIA_SPEED[params.speed ?? "medium"],
					volume: CARTESIA_VOLUME,
					emotion: params.emotion || "neutral",
				},
			};
			for await (const response of ws.generate(req)) {
				if (response.type === "chunk" && response.audio) {
					audioChunks.push(
						Buffer.isBuffer(response.audio)
							? response.audio
							: Buffer.from(response.audio),
					);
				}
				if (response.type === "timestamps" && response.word_timestamps) {
					const { words, start, end } = response.word_timestamps;
					for (let i = 0; i < words.length; i++) {
						textTimestamps.push({
							text: words[i],
							start: start[i],
							end: end[i],
						});
					}
				}
			}

			const combined = Buffer.concat(audioChunks);
			if (combined.length === 0) {
				throw new Error(
					`Cartesia returned no audio for voice ${params.voiceId}`,
				);
			}

			return {
				data: wrapPcmInWav(combined).toString("base64"),
				textTimestamps,
				// We add an extra second for brief pauses between audio segments
				// to make it sound more natural
				metadata: { durationSec: pcmDurationSec(combined.length) + 1 },
			};
		} finally {
			ws.close();
		}
	}
}
