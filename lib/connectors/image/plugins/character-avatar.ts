import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { getProjectStore } from "@/lib/project/store";

export function createCharacterAvatarPlugin(
	projectId: string,
	name: string,
	appearance: string,
	inputsSignature: string,
): ConnectorPlugin<{ prompt: string }, AssetResult> {
	const store = () => getProjectStore(projectId).getState();
	return {
		name: "character-avatar",
		transformPrompt() {
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
			// Record the signature of the inputs this image was actually generated
			// from (the snapshot the job carried), not the live values which may
			// have been edited mid-flight, so the recorded source is always honest.
			state.setCharacter(name, {
				...existing,
				avatarUrl: result.imageUrl,
				avatarInputsSignature: inputsSignature,
			});
			return result;
		},
	};
}
