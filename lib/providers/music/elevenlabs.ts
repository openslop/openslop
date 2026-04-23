import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider, type WithMetadata } from "../base";
import { streamToBuffer } from "../stream";

type MusicResult = {
	data: ArrayBuffer;
} & WithMetadata;

export class ElevenLabsMusic extends BaseProvider<
	MusicGenerateParams,
	MusicResult
> {
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	private client: ElevenLabsClient;

	constructor(apiKey: string) {
		super();
		this.client = new ElevenLabsClient({ apiKey });
	}

	protected toFiles(r: MusicResult): BundleFile[] {
		return [
			{
				key: "audio",
				filename: "output.mp3",
				data: r.data,
				contentType: "audio/mpeg",
			},
		];
	}

	protected async _generate(params: MusicGenerateParams) {
		const durationSeconds = params.durationSeconds ?? 30;
		const stream = await this.client.music.compose({
			prompt: params.prompt,
			musicLengthMs: durationSeconds * 1000,
			modelId: (params.model as "music_v1") || "music_v1",
			outputFormat: "mp3_22050_32",
		});

		return {
			data: await streamToBuffer(stream),
			metadata: { durationSec: durationSeconds },
		};
	}
}
