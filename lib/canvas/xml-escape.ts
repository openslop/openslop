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
	apos: "'",
};

const ENTITY = /&(?:(amp|lt|gt|quot|apos)|#([0-9]+)|#x([0-9a-fA-F]+));/g;

const MAX_CODE_POINT = 0x10ffff;
const isSurrogate = (codePoint: number) =>
	codePoint >= 0xd800 && codePoint <= 0xdfff;

function decodeCodePoint(entity: string, codePoint: number): string {
	if (codePoint < 1 || codePoint > MAX_CODE_POINT || isSurrogate(codePoint))
		return entity;
	return String.fromCodePoint(codePoint);
}

export function escapeXml(value: string): string {
	return value.replace(/[&<>"]/g, (char) => ESCAPES[char] ?? char);
}

/** Model output is XML, so it may spell a character as &apos; or &#39; as well as the four we write. */
export function unescapeXml(value: string): string {
	return value.replace(
		ENTITY,
		(entity, name?: string, decimal?: string, hex?: string) => {
			if (name) return UNESCAPES[name] ?? entity;
			if (decimal) return decodeCodePoint(entity, Number.parseInt(decimal, 10));
			if (hex) return decodeCodePoint(entity, Number.parseInt(hex, 16));
			return entity;
		},
	);
}
