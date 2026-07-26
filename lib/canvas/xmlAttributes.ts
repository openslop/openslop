// OSML attribute values carry free text the user types (art styles, character
// names, prompts). Left raw, a quote truncates the value and an angle bracket
// ends the tag early, so the element comes back mangled on the next load.

const ENTITIES: Record<string, string> = {
	"&quot;": '"',
	"&apos;": "'",
	"&lt;": "<",
	"&gt;": ">",
	"&amp;": "&",
};

export function escapeXmlAttribute(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

export function unescapeXmlAttribute(value: string): string {
	return value.replaceAll(
		/&(?:quot|apos|lt|gt|amp);/g,
		(entity) => ENTITIES[entity] ?? entity,
	);
}
