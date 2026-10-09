import pick from "lodash/pick";
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
			pick(voiceOf(canvas, speakerOf(attrs)), ["provider", "model"]),
		reads: [
			chosenVoices(({ generationAttributes: attrs }) => [speakerOf(attrs)]),
		],
		prepare: ({ generationAttributes: attrs }, ctx, signal) =>
			settleVoice(speakerOf(attrs), ctx, signal, attrs),
		beforeGenerate: (params, ctx) => ({
			...params,
			voiceId: recordedVoice(ctx, speakerOf(params)).voiceId,
		}),
	};
}
