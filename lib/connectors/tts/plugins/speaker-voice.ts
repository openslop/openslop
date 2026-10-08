import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { NARRATOR } from "@/lib/canvas/assets";
import { recordedVoice, settleVoice, voiceModel, voiceReads } from "../voices";

/** Speech speaks in its speaker's voice, on the pair that voice was found on. */
export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "speaker-voice",
		model: ({ generationAttributes: attrs }, canvas) =>
			voiceModel(canvas, attrs?.name, attrs),
		reads: ({ generationAttributes: attrs }, { canvas }) =>
			voiceReads(canvas, [attrs?.name ?? NARRATOR]),
		prepare: ({ generationAttributes: attrs }, ctx) =>
			settleVoice(attrs?.name, ctx, attrs),
		beforeGenerate: (params, ctx) => ({
			...params,
			voiceId: recordedVoice(ctx, params.name).voiceId,
		}),
	};
}
