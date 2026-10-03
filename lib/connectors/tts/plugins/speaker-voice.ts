import omit from "lodash/omit";
import { findAsset } from "@/lib/canvas/assets";
import type { ScriptElement } from "@/lib/canvas/types";
import { resolveModel } from "@/lib/connectors/models";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { settleVoice, speakerVoice, VOICE_SEARCH_KEYS } from "../voices";

const speakingModel = (
	{ generationAttributes: attrs }: ScriptElement,
	canvas: readonly unknown[],
) =>
	resolveModel(
		"tts",
		findAsset(canvas, "voice", attrs?.name)?.generationAttributes,
		attrs,
	);

/** Speech speaks in its speaker's voice, on the pair that voice was found on. */
export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "speaker-voice",
		model: speakingModel,
		reads: (element, ctx) =>
			speakerVoice(element.generationAttributes?.name).reads(element, ctx),
		prepare: (element, { canvas }) =>
			settleVoice(
				element.generationAttributes?.name,
				speakingModel(element, canvas),
				canvas,
			),
		beforeGenerate: (params, ctx) => ({
			...omit(params, VOICE_SEARCH_KEYS),
			voiceId: speakerVoice(params.name).value(ctx).voiceId,
		}),
	};
}
