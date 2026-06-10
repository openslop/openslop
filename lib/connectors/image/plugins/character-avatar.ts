import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { getProjectStore } from "@/lib/project/store";

export function createCharacterAvatarPlugin(
	projectId: string,
	name: string,
): ConnectorPlugin<{ prompt: string }, AssetResult> {
	const store = () => getProjectStore(projectId).getState();
	return {
		name: "character-avatar",
		transformPrompt() {
			const appearance = store().metadata.characters[name]?.appearance ?? "";
			return [
				`Character portrait of ${name}`,
				appearance,
				`A small rectangular nameplate at the bottom of the frame reads "${name}" in clean sans-serif lettering`,
				"White background",
			].join(". ");
		},
		afterGenerate(result) {
			if (!result.imageUrl) {
				throw new Error("character-avatar plugin expected an imageUrl result");
			}
			const state = store();
			const existing = state.metadata.characters[name];
			if (!existing) return result;
			state.setCharacter(name, {
				...existing,
				avatarUrl: result.imageUrl,
				avatarSourceAppearance: existing.appearance,
			});
			return result;
		},
	};
}
