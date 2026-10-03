import type { ConnectorPlugin } from "@/lib/connectors/types";

type CastParams = { prompt: string; name?: string };

/** Frames a cast element's appearance, its prompt, as the character's portrait. */
export function createCharacterAvatarPlugin(): ConnectorPlugin<CastParams> {
	return {
		name: "character-avatar",
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
