import type { Character } from "./types";

export type Pictured = Character & { avatarUrl: string };

export const isPictured = (character: Character): character is Pictured =>
	Boolean(character.avatarUrl);

export const pictured = (characters: Character[]): Pictured[] =>
	characters.filter(isPictured);

export type Voiced = Character & { voice: NonNullable<Character["voice"]> };

export const isVoiced = (character: Character): character is Voiced =>
	Boolean(character.voice);

export const voiced = (characters: Character[]): Voiced[] =>
	characters.filter(isVoiced);

export const characterAvatars = (characters: Character[]): string[] =>
	pictured(characters).map(({ avatarUrl }) => avatarUrl);
