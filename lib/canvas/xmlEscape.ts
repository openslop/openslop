/**
 * OSML is the persisted project format, so anything a user types into element
 * text or an attribute has to survive a serialize/parse round trip. Without
 * escaping, a quote or angle bracket in a prompt truncates the attribute or
 * reparses as a new tag, silently destroying the element on reload.
 */

const ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
};

const UNESCAPES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
};

export function escapeXml(value: string): string {
	return value.replace(/[&<>"]/g, (char) => ESCAPES[char] ?? char);
}

export function unescapeXml(value: string): string {
	return value.replace(
		/&(amp|lt|gt|quot);/g,
		(entity, name: string) => UNESCAPES[name] ?? entity,
	);
}
