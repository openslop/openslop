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
import { fetchAllowedVoicePreview } from "./voicePreview";
import { buildQueryText, rankBySimilarity } from "./voiceSimilarity";
import { GenerationRequest } from "@cartesia/cartesia-js/resources/tts.mjs";

type RawTTSResult = {
	data: string;
	textTimestamps: TextTimestamp[];
} & WithMetadata;

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 1;
const ENCODING = "pcm_f32le";

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

function wrapPcmInWav(pcm: Buffer): Buffer {
	const { audioFormat, bitsPerSample } = PCM_WAV_PARAMS[ENCODING];
	const byteRate = SAMPLE_RATE * NUM_CHANNELS * (bitsPerSample / 8);
	const blockAlign = NUM_CHANNELS * (bitsPerSample / 8);
	const header = Buffer.alloc(44);

	header.write("RIFF", 0);
	header.writeUInt32LE(36 + pcm.length, 4);
	header.write("WAVE", 8);
	header.write("fmt ", 12);
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(audioFormat, 20);
	header.writeUInt16LE(NUM_CHANNELS, 22);
	header.writeUInt32LE(SAMPLE_RATE, 24);
	header.writeUInt32LE(byteRate, 28);
	header.writeUInt16LE(blockAlign, 32);
	header.writeUInt16LE(bitsPerSample, 34);
	header.write("data", 36);
	header.writeUInt32LE(pcm.length, 40);

	return Buffer.concat([header, pcm]);
}

const PREVIEW_HOST = "files.cartesia.ai";

export class CartesiaTTS extends BaseProvider<TTSGenerateParams, RawTTSResult> {
	protected readonly blobConfig = { type: "tts", provider: "cartesia" };
	private client: Cartesia;
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
		this.client = new Cartesia({ apiKey });
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
		const { age, gender, limit, language } = params;
		let results = await this.searchOnce(age, gender, language);
		if (results.length === 0 && age) {
			results = await this.searchOnce(undefined, gender, language);
		}
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
		return limit ? ranked.slice(0, limit) : ranked;
	}

	private async searchOnce(
		query?: string,
		gender?: TTSGender,
		language?: string,
	): Promise<VoiceInfo[]> {
		const page = await this.client.voices.list({
			q: query,
			gender,
			limit: 100,
			expand: ["preview_file_url"],
		});
		return page.data
			.map((voice) => ({
				id: voice.id,
				name: voice.name,
				language: voice.language,
				gender: TTS_GENDERS.find((g) => g === voice.gender),
				description: voice.description,
				previewUrl: voice.preview_file_url
					? `/api/v1/tts/voices/preview?url=${encodeURIComponent(voice.preview_file_url)}`
					: undefined,
			}))
			.filter((voice) => !language || voice.language === language);
	}

	protected async _generate(params: TTSGenerateParams) {
		if (!params.voiceId) throw new Error("voiceId is required");
		const ws = await this.client.tts.websocket();
		await ws.connect();

		try {
			const audioChunks: Buffer[] = [];
			const textTimestamps: TextTimestamp[] = [];
			const req: GenerationRequest = {
				model_id: params.model || "sonic-3",
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

			const lastTs = textTimestamps[textTimestamps.length - 1];
			return {
				data: wrapPcmInWav(combined).toString("base64"),
				textTimestamps,
				metadata: lastTs ? { durationSec: lastTs.end + 1 } : undefined,
			};
		} finally {
			ws.close();
		}
	}
}
