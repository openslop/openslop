import uniq from "lodash/uniq";

const CHARACTER_REF = /\{\{([^{}\s](?:[^{}]*[^{}\s])?)\}\}/;
const CHARACTER_REFS = new RegExp(CHARACTER_REF, "g");

export const characterRef = (name: string): string => `{{${name}}}`;

export function findCharacterRef(
	text: string,
): { name: string; start: number; end: number } | undefined {
	const match = CHARACTER_REF.exec(text);
	if (!match?.[1]) return undefined;
	return {
		name: match[1],
		start: match.index,
		end: match.index + match[0].length,
	};
}

export const referencedNames = (prompt: string): string[] =>
	uniq(Array.from(prompt.matchAll(CHARACTER_REFS), ([, name = ""]) => name));

export const seats =
	(cast: readonly { name: string }[], token: (seat: number) => string) =>
	(name: string): string => {
		const at = cast.findIndex((character) => character.name === name);
		return at < 0 ? name : token(at + 1);
	};

export const renderCharacterRefs = (
	prompt: string,
	refOf: (name: string) => string = (name) => name,
): string => prompt.replace(CHARACTER_REFS, (_, name: string) => refOf(name));
