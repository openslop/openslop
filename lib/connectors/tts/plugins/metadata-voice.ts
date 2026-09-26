import { requireContext } from "@/lib/connectors/plugins";
import { dependency } from "@/lib/generation/dependency";
import { forVoice } from "@/lib/generation/sourceNodes";
import { declaredLanguage } from "@/lib/project/language";
import {
	metadataVoiceFor,
	resolveVoice,
	voiceIdOn,
	voiceTraitsSchema,
} from "@/lib/project/types";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type {
	ConnectorPlugin,
	ModelRef,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";

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

export function createMetadataVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		model: voiceModel,
		dependencies: [speakerVoice],
		beforeGenerate(params, ctx) {
			const { metadata } = requireContext(ctx, "state", "metadata-voice");
			const voice = metadataVoiceFor(metadata, params.name);
			if (!voice) return params;
			const traits = voiceTraitsSchema.parse(voice);
			return {
				...params,
				...traits,
				language: declaredLanguage(metadata.language) ?? traits.language,
				voiceId: voiceIdOn(
					voice,
					requireContext(ctx, "model", "metadata-voice"),
				),
			};
		},
	};
}
