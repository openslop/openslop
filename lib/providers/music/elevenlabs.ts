import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
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

type MusicModelId = (typeof MUSIC_MODELS)[keyof typeof MUSIC_MODELS];

const MUSIC_MODEL_IDS: readonly MusicModelId[] = Object.values(MUSIC_MODELS);
const DEFAULT_MUSIC_MODEL: MusicModelId = "music_v1";

function toMusicModelId(model: string | undefined): MusicModelId {
	return MUSIC_MODEL_IDS.find((id) => id === model) ?? DEFAULT_MUSIC_MODEL;
}

export class ElevenLabsMusic extends BaseElevenLabsAudio<MusicGenerateParams> {
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

	protected requestStream(params: MusicGenerateParams) {
		return this.client.music.compose({
			prompt: params.prompt,
			musicLengthMs:
				params.durationSeconds != null
					? params.durationSeconds * 1000
					: undefined,
			modelId: toMusicModelId(params.model),
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
