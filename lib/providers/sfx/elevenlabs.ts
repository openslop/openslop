import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import type { AudioFormat } from "../audio-duration";
import { audioBundleCache, pineconeCache } from "../cache";
import { BaseElevenLabsAudio, toElevenLabsOutputFormat } from "../elevenlabs";

export class ElevenLabsSFX extends BaseElevenLabsAudio<SFXGenerateParams> {
	protected readonly blobConfig = { type: "sfx", provider: "elevenlabs" };
	protected readonly outputFormat: AudioFormat = {
		codec: "mp3",
		sampleRate: 44100,
		bitrateKbps: 128,
	};

	protected requestStream(params: SFXGenerateParams) {
		return this.client.textToSoundEffects.convert({
			text: params.prompt,
			durationSeconds: params.durationSeconds,
			outputFormat: toElevenLabsOutputFormat(this.outputFormat),
		});
	}
}

ElevenLabsSFX.prototype.generate = pineconeCache<
	[SFXGenerateParams],
	BundleResponse
>(ElevenLabsSFX.prototype.generate, {
	index: process.env.PINECONE_SFX_INDEX || "sfx",
	serialize: (p) => p.prompt,
	...audioBundleCache,
});
