import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import type { AudioFormat } from "../audio-duration";
import { audioBundleCache, pineconeCache } from "../cache";
import { BaseElevenLabsAudio, toElevenLabsOutputFormat } from "../elevenlabs";

export class ElevenLabsMusic extends BaseElevenLabsAudio<MusicGenerateParams> {
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly outputFormat: AudioFormat = {
		codec: "mp3",
		sampleRate: 44100,
		bitrateKbps: 128,
	};

	protected requestStream(params: MusicGenerateParams) {
		return this.client.music.compose({
			prompt: params.prompt,
			musicLengthMs:
				params.durationSeconds != null
					? params.durationSeconds * 1000
					: undefined,
			modelId: (params.model as "music_v1") || "music_v1",
			outputFormat: toElevenLabsOutputFormat(this.outputFormat),
		});
	}
}

ElevenLabsMusic.prototype.generate = pineconeCache<
	[MusicGenerateParams],
	BundleResponse
>(ElevenLabsMusic.prototype.generate, {
	index: process.env.PINECONE_MUSIC_INDEX ?? "music",
	serialize: (p) => p.prompt,
	...audioBundleCache,
});
