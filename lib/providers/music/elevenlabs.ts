import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { VendorParams } from "@/lib/connectors/models";
import type { MusicGenerateParams } from "@/lib/connectors/types";
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
import type { MusicProvider } from "../types";

type MusicRequest = VendorParams<MusicGenerateParams>;

export class ElevenLabsMusic
	extends BaseElevenLabsAudio<MusicRequest>
	implements MusicProvider
{
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

	protected requestStream(params: MusicRequest) {
		return this.client.music.compose({
			prompt: params.prompt,
			musicLengthMs:
				params.durationSeconds != null
					? params.durationSeconds * 1000
					: undefined,
			modelId: params.model as "music_v1",
			outputFormat: toElevenLabsOutputFormat(this.outputFormat),
			forceInstrumental: true,
		});
	}
}

ElevenLabsMusic.prototype.generate = pineconeCache<
	[MusicRequest],
	BundleResponse
>(ElevenLabsMusic.prototype.generate, {
	index: process.env.PINECONE_MUSIC_INDEX || "music",
	serialize: (p) => p.prompt,
	rank: rankByNearestDuration,
	...audioBundleCache("music"),
});
