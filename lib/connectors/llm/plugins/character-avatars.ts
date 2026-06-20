import type { MetadataCharacter } from "@/lib/project/types";

type CharacterAvatarSource = "uploaded" | "generated";

export type CharacterAvatarReference = {
	name: string;
	character: MetadataCharacter;
	url: string;
	source: CharacterAvatarSource;
};

export function isGeneratedCharacter(character: MetadataCharacter): boolean {
	return !character.avatarUploaded;
}

export function listCharacterAvatars(
	characters: Record<string, MetadataCharacter>,
): CharacterAvatarReference[] {
	return Object.entries(characters).flatMap(([name, character]) => {
		if (!character.avatarUrl) return [];
		return [
			{
				name,
				character,
				url: character.avatarUrl,
				source: isGeneratedCharacter(character) ? "generated" : "uploaded",
			},
		];
	});
}

export function listUploadedCharacterAvatarUrls(
	characters: Record<string, MetadataCharacter>,
): string[] {
	return Object.values(characters).flatMap((character) =>
		character.avatarUrl && !isGeneratedCharacter(character)
			? [character.avatarUrl]
			: [],
	);
}
