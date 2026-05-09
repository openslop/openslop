import type { SFXGenerateParams } from "@/lib/connectors/types";
import type { AudioFormat } from "../audio-duration";
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
