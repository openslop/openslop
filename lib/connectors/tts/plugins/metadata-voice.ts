import { requireState } from "@/lib/connectors/plugins";
import { voiceNode } from "@/lib/generation/sourceNodes";
import { MetadataVoiceSchema } from "@/lib/project/types";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

export function createMetadataVoicePlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		dependencies: (element, ctx) => [
			voiceNode(ctx.state, element.customAttributes?.name),
		],
		beforeGenerate(params, ctx) {
			const { narration, characters } = requireState(
				ctx,
				"metadata-voice",
			).metadata;
			const voice = params.name ? characters[params.name] : narration;
			if (!voice) return params;
			const { resolvedVoiceId, ...fields } = MetadataVoiceSchema.parse(voice);
			return {
				...params,
				...fields,
				voiceId: fields.voiceId ?? resolvedVoiceId,
			};
		},
	};
}
