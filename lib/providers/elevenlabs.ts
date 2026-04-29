import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider, type WithMetadata } from "./base";
import { streamToBuffer } from "./stream";

type AudioResult = {
	data: ArrayBuffer;
} & WithMetadata;

/** Shared base for ElevenLabs providers that emit a single MP3 audio asset. */
export abstract class BaseElevenLabsAudio<
	TParams extends { durationSeconds?: number },
> extends BaseProvider<TParams, AudioResult> {
	protected readonly client: ElevenLabsClient;

	constructor(apiKey: string) {
		super();
		this.client = new ElevenLabsClient({ apiKey });
	}

	protected abstract readonly defaultDurationSeconds: number;

	protected abstract requestStream(
		params: TParams,
		durationSeconds: number,
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
		const durationSeconds =
			params.durationSeconds ?? this.defaultDurationSeconds;
		const stream = await this.requestStream(params, durationSeconds);
		return {
			data: await streamToBuffer(stream),
			metadata: { durationSec: durationSeconds },
		};
	}
}
