import { speakerOf, voiceOf } from "@/lib/canvas/assets";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { chosenVoices, recordedVoice, settleVoice } from "../voices";

/** Speech speaks in its speaker's voice, on the pair that voice was found on. */
export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "speaker-voice",
		model: ({ generationAttributes: attrs }, canvas) =>
			voiceOf(canvas, speakerOf(attrs)),
		reads: [
			chosenVoices(({ generationAttributes: attrs }) => [speakerOf(attrs)]),
		],
		prepare: ({ generationAttributes: attrs }, ctx) =>
			settleVoice(speakerOf(attrs), ctx, attrs),
		beforeGenerate: (params, ctx) => ({
			...params,
			voiceId: recordedVoice(ctx, speakerOf(params)).voiceId,
		}),
	};
}
