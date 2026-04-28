import type { ConnectorPlugin, TTSConnectorParams } from "../types";
import { getProjectStore } from "@/lib/project/store";

export function createMetadataVoicePlugin(
	projectId: string,
): ConnectorPlugin<TTSConnectorParams> {
	return {
		name: "metadata-voice",
		beforeGenerate(params) {
			const { narration, characters } =
				getProjectStore(projectId).getState().metadata;
			const voice = params.name ? characters[params.name] : narration;
			if (!voice) return params;
			const { gender, age, pitch, accent, texture } = voice;
			return {
				...params,
				...(gender && { gender }),
				...(age && { age }),
				...(pitch && { pitch }),
				...(accent && { accent }),
				...(texture && { texture }),
			};
		},
	};
}
