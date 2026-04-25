import type { ConnectorPlugin } from "../types";
import { getProjectStore } from "@/lib/project/store";

export type ParamsWithCharacters = { prompt: string; characters?: string };

export function createCharacterReferencesPlugin(
	projectId: string,
): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-references",
		beforeGenerate(params) {
			const { characters, ...rest } = params;
			if (!characters) return params;

			const { characters: chars } =
				getProjectStore(projectId).getState().metadata;
			const referenceImages = characters
				.split(",")
				.map((name) => chars[name.trim()]?.avatarUrl)
				.filter(Boolean);

			return {
				...rest,
				...(referenceImages.length > 0 && { referenceImages }),
			};
		},
	};
}
