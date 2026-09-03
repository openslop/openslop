import { resolveModel } from "@/lib/connectors/models";
import { requireModel, requireState } from "@/lib/connectors/plugins";
import { forVoice } from "@/lib/generation/sourceNodes";
import { declaredLanguage } from "@/lib/project/language";
import {
	metadataVoiceFor,
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
	resolveModel(
		"tts",
		metadataVoiceFor(state.metadata, element.generationAttributes?.name),
		element.generationAttributes,
	);

export function createMetadataVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		model: voiceModel,
		dependencies: (element) => [
			(state) =>
				forVoice(
					element.generationAttributes?.name,
					voiceModel(element, state),
				)(state),
		],
		beforeGenerate(params, ctx) {
			const { metadata } = requireState(ctx, "metadata-voice");
			const voice = metadataVoiceFor(metadata, params.name);
			if (!voice) return params;
			const traits = voiceTraitsSchema.parse(voice);
			return {
				...params,
				...traits,
				language: declaredLanguage(metadata.language) ?? traits.language,
				voiceId: voiceIdOn(voice, requireModel(ctx, "metadata-voice")),
			};
		},
	};
}
