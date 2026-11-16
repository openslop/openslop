import compact from "lodash/compact";
import pick from "lodash/pick";
import { voiceOf } from "@/lib/canvas/assets";
import {
	type ConnectorPlugin,
	MODEL_REF_KEYS,
	type TTSGenerateParams,
} from "@/lib/connectors/types";
import { foundVoice, speakerVoices } from "@/lib/connectors/voice/voices";

/** Speech speaks in its speaker's voice, on that voice's model. */
export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "speaker-voice",
		model: ({ generationAttributes: attrs }, canvas) =>
			attrs?.name ? pick(voiceOf(canvas, attrs.name), MODEL_REF_KEYS) : {},
		dependencies: [
			speakerVoices(({ generationAttributes: attrs }) =>
				compact([attrs?.name]),
			),
		],
		beforeGenerate: (params, ctx) => {
			const { name } = params;
			if (!name) throw new Error("Pick who says this line");
			const voiceId = foundVoice(ctx, name)?.voiceId;
			if (!voiceId) throw new Error(`${name} has no voice`);
			return { ...params, voiceId };
		},
	};
}
