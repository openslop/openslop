import type { VendorParams } from "@/lib/connectors/models";
import type { SFXGenerateParams } from "@/lib/connectors/types";
import {
	BaseElevenLabsAudio,
	ELEVENLABS_AUDIO_FORMAT,
	toElevenLabsOutputFormat,
} from "../elevenlabs";
import type { SFXProvider } from "../types";

type SFXRequest = VendorParams<SFXGenerateParams>;

/** The Scale plan is $299 for 9,000 generations. */
const USD_PER_GENERATION = 299 / 9000;

export class ElevenLabsSFX
	extends BaseElevenLabsAudio<SFXRequest>
	implements SFXProvider
{
	protected readonly blobConfig = { type: "sfx", provider: "elevenlabs" };
	protected readonly outputFormat = ELEVENLABS_AUDIO_FORMAT;

	protected costUsd() {
		return USD_PER_GENERATION;
	}

	protected requestStream(params: SFXRequest) {
		return this.client.textToSoundEffects.convert({
			text: params.prompt,
			durationSeconds: params.durationSeconds,
			modelId: params.model,
			outputFormat: toElevenLabsOutputFormat(this.outputFormat),
		});
	}
}
