const ESCAPES: Record<string, string> = {
	"&": "&amp;",
	'"': "&quot;",
	"<": "&lt;",
	">": "&gt;",
};

const ENTITIES: Record<string, string> = {
	amp: "&",
	quot: '"',
	apos: "'",
	lt: "<",
	gt: ">",
};

/**
 * OSML attribute values are delimited by `"` and terminated by `>`, so a raw
 * quote or angle bracket in a prompt silently truncates or drops the attribute
 * when the script round-trips through the DB and back into the parser.
 */
export const escapeXmlAttribute = (value: string): string =>
	value.replace(/[&"<>]/g, (char) => ESCAPES[char] ?? char);

export const unescapeXmlEntities = (value: string): string =>
	value.replace(
		/&(amp|quot|apos|lt|gt);/g,
		(entity, name: string) => ENTITIES[name] ?? entity,
	);
