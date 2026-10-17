import type { Character } from "./types";

export type Pictured = Character & { avatarUrl: string };

export const pictured = (characters: Character[]): Pictured[] =>
	characters.filter((character): character is Pictured =>
		Boolean(character.avatarUrl),
	);

export type Voiced = Character & { voice: NonNullable<Character["voice"]> };

export const voiced = (characters: Character[]): Voiced[] =>
	characters.filter((character): character is Voiced =>
		Boolean(character.voice),
	);

export const characterAvatars = (characters: Character[]): string[] =>
	pictured(characters).map(({ avatarUrl }) => avatarUrl);
