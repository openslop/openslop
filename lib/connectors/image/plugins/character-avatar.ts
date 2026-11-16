import type { ConnectorPlugin } from "@/lib/connectors/types";

type CharacterParams = { prompt: string; name?: string };

/** Frames a character's appearance, its prompt, as the character's turnaround sheet. */
export function createCharacterAvatarPlugin(): ConnectorPlugin<CharacterParams> {
	return {
		name: "character-avatar",
		beforeGenerate: ({ prompt, name, ...params }) => {
			if (!name)
				throw new Error(
					"A character turnaround sheet needs the character's name",
				);
			return {
				...params,
				prompt: [
					`Character turnaround sheet of ${name}: a close-up of the face, plus full-body front, side and three-quarter views`,
					prompt,
					"Same look and outfit in every view",
					"Plain light gray background with nothing else on it",
					"No text",
				].join(". "),
			};
		},
	};
}
