import type { SFXGenerateParams } from "@/lib/connectors/types";
import { BaseElevenLabsAudio } from "../elevenlabs";

export class ElevenLabsSFX extends BaseElevenLabsAudio<SFXGenerateParams> {
	protected readonly blobConfig = { type: "sfx", provider: "elevenlabs" };
	protected readonly defaultDurationSeconds = 5;

	protected requestStream(params: SFXGenerateParams, durationSeconds: number) {
		return this.client.textToSoundEffects.convert({
			text: params.prompt,
			durationSeconds,
			outputFormat: "mp3_22050_32",
		});
	}
}
