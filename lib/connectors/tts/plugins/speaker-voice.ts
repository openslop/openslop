import pick from "lodash/pick";
import { speakerOf, voiceOf } from "@/lib/canvas/assets";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { foundVoice, speakerVoices } from "@/lib/connectors/voice/voices";

/** Speech speaks in its speaker's voice, on that voice's model. */
export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "speaker-voice",
		model: ({ generationAttributes: attrs }, canvas) =>
			pick(voiceOf(canvas, speakerOf(attrs)), ["provider", "model"]),
		dependencies: [
			speakerVoices(({ generationAttributes: attrs }) => [speakerOf(attrs)]),
		],
		beforeGenerate: (params, ctx) => {
			const name = speakerOf(params);
			const voiceId = foundVoice(ctx, name)?.voiceId;
			if (!voiceId) throw new Error(`${name} has no voice`);
			return { ...params, voiceId };
		},
	};
}
