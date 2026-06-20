import type { MetadataCharacter } from "@/lib/project/types";

type CharacterAvatarSource = "uploaded" | "generated";

export type CharacterAvatarReference = {
	name: string;
	character: MetadataCharacter;
	url: string;
	source: CharacterAvatarSource;
};

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
				source: character.avatarUploaded ? "uploaded" : "generated",
			},
		];
	});
}

export function listUploadedCharacterAvatarUrls(
	characters: Record<string, MetadataCharacter>,
): string[] {
	return listCharacterAvatars(characters).flatMap((avatar) =>
		avatar.source === "uploaded" ? [avatar.url] : [],
	);
}
