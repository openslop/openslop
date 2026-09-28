import omit from "lodash/omit";
import { requireContext } from "@/lib/connectors/plugins";
import { dependency } from "@/lib/generation/dependency";
import { forVoice } from "@/lib/generation/sourceNodes";
import { resolveVoice } from "@/lib/project/types";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type {
	ConnectorPlugin,
	ModelRef,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";
import { resolveVoiceId, speakerFor, VOICE_SEARCH_KEYS } from "../speakers";

const NAME = "speaker-voice";

/**
 * Speech speaks with the pair its voice picked in the voice's editor, and
 * with the pair it was created with until the voice picks one.
 */
const voiceModel = (
	element: CanvasContentElement,
	state: ProjectData,
): ModelRef =>
	resolveVoice(
		state.metadata,
		element.generationAttributes?.name,
		element.generationAttributes,
	).model;

export const speakerVoice = dependency(
	"voice",
	({ generationAttributes: attrs }) => forVoice(attrs?.name, attrs),
);

export function createSpeakerVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: NAME,
		model: voiceModel,
		dependencies: [speakerVoice],
		async beforeGenerate(params, ctx) {
			const { metadata } = requireContext(ctx, "state", NAME);
			const model = requireContext(ctx, "model", NAME);
			const speaker = speakerFor(metadata, params.name, model);
			const voiced = speaker
				? { ...params, ...speaker.traits, voiceId: speaker.voiceId }
				: params;
			if (voiced.voiceId) return voiced;
			const voiceId = await resolveVoiceId(
				{ name: params.name, model, traits: voiced },
				requireContext(ctx, "searchVoices", NAME),
				requireContext(ctx, "store", NAME),
			);
			return { ...omit(voiced, VOICE_SEARCH_KEYS), voiceId };
		},
	};
}
