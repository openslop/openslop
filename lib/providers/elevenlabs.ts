import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { AllowedOutputFormats } from "@elevenlabs/elevenlabs-js/api";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider, type RawResult } from "./base";
import { validateByProbe } from "./validate";
import { streamToBuffer } from "./stream";

type AudioResult = { data: ArrayBuffer } & RawResult;

export type AudioFormat = {
	sampleRate: number;
	bitrateKbps: number;
};

/** An estimate from size alone, right for the constant-bitrate MP3 ElevenLabs streams. */
const cbrDurationSec = (format: AudioFormat, data: ArrayBuffer): number =>
	(data.byteLength * 8) / (format.bitrateKbps * 1000);

export const ELEVENLABS_AUDIO_FORMAT: AudioFormat = {
	sampleRate: 44100,
	bitrateKbps: 128,
};

export function toElevenLabsOutputFormat(
	format: AudioFormat,
): AllowedOutputFormats {
	return `mp3_${format.sampleRate}_${format.bitrateKbps}` as AllowedOutputFormats;
}

/** Reading the account behind the key is the cheapest authenticated call. */
export const validateElevenLabsKey = (apiKey: string) =>
	validateByProbe("https://api.elevenlabs.io/v1/user", {
		headers: { "xi-api-key": apiKey },
	});

/** Shared base for ElevenLabs providers that emit a single audio asset. */
export abstract class BaseElevenLabsAudio<
	TParams extends { durationSeconds?: number },
> extends BaseProvider<TParams, AudioResult> {
	protected readonly client: ElevenLabsClient;

	constructor(private readonly apiKey: string) {
		super();
		this.client = new ElevenLabsClient({ apiKey });
	}

	async validate() {
		return validateElevenLabsKey(this.apiKey);
	}

	protected abstract readonly outputFormat: AudioFormat;

	/** ElevenLabs reports no per-request cost, so each provider prices from its published rate. */
	protected abstract costUsd(durationSec: number): number;

	protected abstract requestStream(
		params: TParams,
	): Promise<ReadableStream<Uint8Array>>;

	protected toFiles(result: AudioResult): BundleFile[] {
		return [
			{
				key: "audio",
				filename: "output.mp3",
				data: result.data,
				contentType: "audio/mpeg",
			},
		];
	}

	protected async _generate(params: TParams) {
		const stream = await this.requestStream(params);
		const data = await streamToBuffer(stream);
		const durationSec = cbrDurationSec(this.outputFormat, data);
		return {
			data,
			costUsd: this.costUsd(durationSec),
			metadata: { durationSec },
		};
	}
}
