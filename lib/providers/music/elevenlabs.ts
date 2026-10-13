import type { VendorParams } from "@/lib/connectors/models";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import { audioPromptCache } from "../cache";
import {
	BaseElevenLabsAudio,
	ELEVENLABS_AUDIO_FORMAT,
	toElevenLabsOutputFormat,
} from "../elevenlabs";
import type { MusicProvider } from "../types";

type MusicRequest = VendorParams<MusicGenerateParams>;

const USD_PER_SECOND = 0.3 / 60;

const cache = audioPromptCache(
	process.env.PINECONE_MUSIC_INDEX || "music",
	"music",
);

export class ElevenLabsMusic
	extends BaseElevenLabsAudio<MusicRequest>
	implements MusicProvider
{
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

	protected costUsd(durationSec: number) {
		return durationSec * USD_PER_SECOND;
	}

	override generate(params: MusicRequest) {
		return cache.readThrough(params, () => super.generate(params));
	}

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
