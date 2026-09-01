import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { AllowedOutputFormats } from "@elevenlabs/elevenlabs-js/api";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { type AudioFormat, audioDurationSec } from "./audio-duration";
import { BaseProvider, type WithMetadata } from "./base";
import { fromStatus, probe, type ValidatingProvider } from "./validate";
import { streamToBuffer } from "./stream";

type AudioResult = {
	data: ArrayBuffer;
} & WithMetadata;

export const ELEVENLABS_AUDIO_FORMAT: AudioFormat = {
	sampleRate: 44100,
	bitrateKbps: 128,
};

export function toElevenLabsOutputFormat(
	format: AudioFormat,
): AllowedOutputFormats {
	return `mp3_${format.sampleRate}_${format.bitrateKbps}` as AllowedOutputFormats;
}

/** Shared base for ElevenLabs providers that emit a single audio asset. */
export abstract class BaseElevenLabsAudio<
	TParams extends { durationSeconds?: number },
>
	extends BaseProvider<TParams, AudioResult>
	implements ValidatingProvider
{
	protected readonly client: ElevenLabsClient;
	private readonly apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
		this.client = new ElevenLabsClient({ apiKey });
	}

	/** Reading the account behind the key is the cheapest authenticated call. */
	async validate() {
		return fromStatus(
			await probe("https://api.elevenlabs.io/v1/user", {
				headers: { "xi-api-key": this.apiKey },
			}),
		);
	}

	protected abstract readonly outputFormat: AudioFormat;

	protected abstract requestStream(
		params: TParams,
	): Promise<ReadableStream<Uint8Array>>;

	protected toFiles(r: AudioResult): BundleFile[] {
		return [
			{
				key: "audio",
				filename: "output.mp3",
				data: r.data,
				contentType: "audio/mpeg",
			},
		];
	}

	protected async _generate(params: TParams) {
		const stream = await this.requestStream(params);
		const data = await streamToBuffer(stream);
		const durationSec = audioDurationSec(this.outputFormat, data);
		return { data, metadata: { durationSec } };
	}
}
