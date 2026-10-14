import capitalize from "lodash/capitalize";

/** Braces would end a `{{Name}}` reference early, so a name never holds one. */
export const normalizeCharacterName = (raw: string): string =>
	raw
		.replace(/[{}]/g, "")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map(capitalize)
		.join(" ");
