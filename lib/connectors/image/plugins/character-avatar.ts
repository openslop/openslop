import { requireState } from "@/lib/connectors/plugins";
import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";

export function createCharacterAvatarPlugin(
	name: string,
): ConnectorPlugin<{ prompt: string }, AssetResult> {
	return {
		name: "character-avatar",
		transformPrompt(_, ctx) {
			const appearance =
				requireState(ctx, "character-avatar").metadata.characters[name]
					?.appearance ?? "";
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
			return result;
		},
	};
}
