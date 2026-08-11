import { requireState } from "@/lib/connectors/plugins";
import { forVoice } from "@/lib/generation/sourceNodes";
import { declaredLanguage } from "@/lib/project/language";
import { MetadataVoiceSchema } from "@/lib/project/types";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

export function createMetadataVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		dependencies: (element) => [forVoice(element.customAttributes?.name)],
		beforeGenerate(params, ctx) {
			const { narration, characters, language } = requireState(
				ctx,
				"metadata-voice",
			).metadata;
			const voice = params.name ? characters[params.name] : narration;
			if (!voice) return params;
			const { resolvedVoiceId, ...fields } = MetadataVoiceSchema.parse(voice);
			return {
				...params,
				...fields,
				language: declaredLanguage(language) ?? fields.language,
				voiceId: fields.voiceId ?? resolvedVoiceId,
			};
		},
	};
}
