import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider, type WithMetadata } from "../base";
import { streamToBuffer } from "../stream";

type SFXResult = {
	data: ArrayBuffer;
} & WithMetadata;

export class ElevenLabsSFX extends BaseProvider<SFXGenerateParams, SFXResult> {
	protected readonly blobConfig = { type: "sfx", provider: "elevenlabs" };
	private client: ElevenLabsClient;

	constructor(apiKey: string) {
		super();
		this.client = new ElevenLabsClient({ apiKey });
	}

	protected toFiles(r: SFXResult): BundleFile[] {
		return [
			{
				key: "audio",
				filename: "output.mp3",
				data: r.data,
				contentType: "audio/mpeg",
			},
		];
	}

	protected async _generate(params: SFXGenerateParams) {
		const durationSeconds = params.durationSeconds ?? 5;
		const stream = await this.client.textToSoundEffects.convert({
			text: params.prompt,
			durationSeconds,
			outputFormat: "mp3_22050_32",
		});

		return {
			data: await streamToBuffer(stream),
			metadata: { durationSec: durationSeconds },
		};
	}
}
