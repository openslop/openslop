import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { settleVoice, speakerVoice, voiceModel } from "../voices";

/** Speech speaks in its speaker's voice, on the pair that voice was found on. */
export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "speaker-voice",
		model: ({ generationAttributes: attrs }, canvas) =>
			voiceModel(canvas, attrs?.name, attrs),
		reads: (element, ctx) =>
			speakerVoice(element.generationAttributes?.name).reads(element, ctx),
		prepare: ({ generationAttributes: attrs }, ctx) =>
			settleVoice(attrs?.name, ctx, attrs),
		beforeGenerate: (params, ctx) => ({
			...params,
			voiceId: speakerVoice(params.name).value(ctx).voiceId,
		}),
	};
}
