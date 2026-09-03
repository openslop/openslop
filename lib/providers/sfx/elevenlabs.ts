import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import {
	audioBundleCache,
	pineconeCache,
	rankByNearestDuration,
} from "../cache";
import {
	BaseElevenLabsAudio,
	ELEVENLABS_AUDIO_FORMAT,
	toElevenLabsOutputFormat,
} from "../elevenlabs";
import type { SFXProvider } from "../types";

export class ElevenLabsSFX
	extends BaseElevenLabsAudio<SFXGenerateParams>
	implements SFXProvider
{
	protected readonly blobConfig = { type: "sfx", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

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
	rank: rankByNearestDuration,
	...audioBundleCache("sfx"),
});
