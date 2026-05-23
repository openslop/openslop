import { getProjectStore } from "@/lib/project/store";
import { MetadataVoiceSchema } from "@/lib/project/types";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

export function createMetadataVoicePlugin(
	projectId: string,
): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "metadata-voice",
		beforeGenerate(params) {
			const { narration, characters } =
				getProjectStore(projectId).getState().metadata;
			const voice = params.name ? characters[params.name] : narration;
			if (!voice) return params;
			return { ...params, ...MetadataVoiceSchema.parse(voice) };
		},
	};
}
