import { parseCharacterNames } from "@/lib/canvas/characterNames";
import type { ConnectorPlugin } from "@/lib/connectors/types";
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
			const referenceImages = parseCharacterNames(characters)
				.map((name) => chars[name]?.avatarUrl)
				.filter(Boolean);

			return {
				...rest,
				...(referenceImages.length > 0 && { referenceImages }),
			};
		},
	};
}
