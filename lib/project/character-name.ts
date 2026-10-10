import capitalize from "lodash/capitalize";

export const normalizeCharacterName = (raw: string): string =>
	raw.trim().split(/\s+/).filter(Boolean).map(capitalize).join(" ");
