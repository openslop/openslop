import { resolveModel } from "@/lib/connectors/models";
import { requireModel, requireState } from "@/lib/connectors/plugins";
import { forVoice } from "@/lib/generation/sourceNodes";
import { declaredLanguage } from "@/lib/project/language";
import {
	metadataVoiceFor,
	voiceIdOn,
	voiceTraitsSchema,
} from "@/lib/project/types";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

export function createMetadataVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		dependencies: (element) => [
			forVoice(
				element.generationAttributes?.name,
				resolveModel("tts", element.generationAttributes),
			),
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
