import { requireState } from "@/lib/connectors/plugins";
import { forVoice } from "@/lib/generation/sourceNodes";
import { declaredLanguage } from "@/lib/project/language";
import { metadataVoiceFor, MetadataVoiceSchema } from "@/lib/project/types";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

export function createMetadataVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		dependencies: (element) => [forVoice(element.generationAttributes?.name)],
		model: (element, state) =>
			metadataVoiceFor(state.metadata, element.generationAttributes?.name),
		beforeGenerate(params, ctx) {
			const { metadata } = requireState(ctx, "metadata-voice");
			const voice = metadataVoiceFor(metadata, params.name);
			if (!voice) return params;
			const {
				resolvedVoiceId,
				provider: _provider,
				model: _model,
				...fields
			} = MetadataVoiceSchema.parse(voice);
			return {
				...params,
				...fields,
				language: declaredLanguage(metadata.language) ?? fields.language,
				voiceId: fields.voiceId ?? resolvedVoiceId,
			};
		},
	};
}
