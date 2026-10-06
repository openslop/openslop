import { VOICE_KEYS } from "@/lib/canvas/assets";
import type { ConnectorPlugin } from "@/lib/connectors/types";

type CharacterParams = { prompt: string; name?: string };

/** Frames a character's appearance, its prompt, as the character's portrait. */
export function createCharacterAvatarPlugin(): ConnectorPlugin<CharacterParams> {
	return {
		name: "character-avatar",
		ignores: VOICE_KEYS,
		beforeGenerate: ({ prompt, name, ...params }) => ({
			...params,
			prompt: [
				`Character portrait of ${name}`,
				prompt,
				`A small rectangular nameplate at the bottom of the frame reads "${name}" in clean sans-serif lettering`,
				"Plain solid white background, with no scenery, objects or location behind them",
			].join(". "),
		}),
	};
}
