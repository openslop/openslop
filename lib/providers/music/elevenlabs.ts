import { isToggleOn } from "@/lib/canvas/types";
import type { VendorParams } from "@/lib/connectors/models";
import type { MusicGenerateParams } from "@/lib/connectors/types";
import {
	BaseElevenLabsAudio,
	ELEVENLABS_AUDIO_FORMAT,
	toElevenLabsOutputFormat,
} from "../elevenlabs";
import type { MusicProvider } from "../types";

type MusicRequest = VendorParams<MusicGenerateParams>;

/** The Scale plan is $299 for 1,993 minutes of music. */
const USD_PER_SECOND = 0.15 / 60;

export class ElevenLabsMusic
	extends BaseElevenLabsAudio<MusicRequest>
	implements MusicProvider
{
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

	protected costUsd(durationSec: number) {
		return durationSec * USD_PER_SECOND;
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
			forceInstrumental: !isToggleOn(params.lyrics),
		});
	}
}
