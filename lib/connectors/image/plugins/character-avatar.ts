import type { ConnectorPlugin } from "@/lib/connectors/types";

type CharacterParams = { prompt: string; name?: string };

/** Frames a character's appearance, its prompt, as the character's portrait. */
export function createCharacterAvatarPlugin(): ConnectorPlugin<CharacterParams> {
	return {
		name: "character-avatar",
		beforeGenerate: ({ prompt, name, ...params }) => {
			if (!name)
				throw new Error("A character portrait needs the character's name");
			return {
				...params,
				prompt: [
					`Character portrait of ${name}`,
					prompt,
					`A small rectangular nameplate at the bottom of the frame reads "${name}" in clean sans-serif lettering`,
					"Plain solid white background, with no scenery, objects or location behind them",
				].join(". "),
			};
		},
	};
}
