import uniq from "lodash/uniq";

const NAME_REF = /\{\{([^{}\s](?:[^{}]*[^{}\s])?)\}\}/;
const NAME_REFS = new RegExp(NAME_REF, "g");

export const nameRef = (name: string): string => `{{${name}}}`;

export function findNameRef(
	text: string,
): { name: string; start: number; end: number } | undefined {
	const match = NAME_REF.exec(text);
	if (!match?.[1]) return undefined;
	return {
		name: match[1],
		start: match.index,
		end: match.index + match[0].length,
	};
}

export const referencedNames = (prompt: string): string[] =>
	uniq(Array.from(prompt.matchAll(NAME_REFS), ([, name = ""]) => name));

export const seats =
	(cast: readonly { name: string }[], token: (seat: number) => string) =>
	(name: string): string => {
		const at = cast.findIndex((character) => character.name === name);
		return at < 0 ? name : token(at + 1);
	};

export const renderPrompt = (
	prompt: string,
	refOf: (name: string) => string = (name) => name,
): string => prompt.replace(NAME_REFS, (_, name: string) => refOf(name));
