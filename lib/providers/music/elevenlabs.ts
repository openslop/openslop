import type { BundleResponse } from "@/lib/api/asset-bundle";
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
import type { MusicProvider } from "./base";

export class ElevenLabsMusic
	extends BaseElevenLabsAudio<MusicGenerateParams>
	implements MusicProvider
{
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

	protected requestStream(params: MusicGenerateParams) {
		return this.client.music.compose({
			prompt: params.prompt,
			musicLengthMs:
				params.durationSeconds != null
					? params.durationSeconds * 1000
					: undefined,
			modelId: (params.model as "music_v1") || "music_v1",
			outputFormat: toElevenLabsOutputFormat(this.outputFormat),
			forceInstrumental: true,
		});
	}
}

ElevenLabsMusic.prototype.generate = pineconeCache<
	[MusicGenerateParams],
	BundleResponse
>(ElevenLabsMusic.prototype.generate, {
	index: process.env.PINECONE_MUSIC_INDEX || "music",
	serialize: (p) => p.prompt,
	rank: rankByNearestDuration,
	...audioBundleCache("music"),
});
