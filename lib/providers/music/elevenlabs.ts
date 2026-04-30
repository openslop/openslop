import type { MusicGenerateParams } from "@/lib/connectors/types";
import { BaseElevenLabsAudio } from "../elevenlabs";

export class ElevenLabsMusic extends BaseElevenLabsAudio<MusicGenerateParams> {
	protected readonly blobConfig = { type: "music", provider: "elevenlabs" };
	protected readonly defaultDurationSeconds = 30;

	protected requestStream(
		params: MusicGenerateParams,
		durationSeconds: number,
	) {
		return this.client.music.compose({
			prompt: params.prompt,
			musicLengthMs: durationSeconds * 1000,
			modelId: (params.model as "music_v1") || "music_v1",
			outputFormat: "mp3_22050_32",
		});
	}
}
