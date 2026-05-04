import type { AssetResult, ConnectorPlugin } from "../types";
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
			store().updateMetadata({
				characters: { [name]: { avatarUrl: result.url } },
			});
			return result;
		},
	};
}
