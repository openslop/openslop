import { unescapeXmlEntities } from "./xmlEntities";

const ATTRIBUTE_PATTERN = /([\w-]+)="([^"]*)"/g;

export function parseXmlTag(tagString: string): Record<string, string> {
	const body = tagString.trim().replace(/\/$/, "");
	const tag = /^\S*/.exec(body)?.[0] ?? "";
	const attributes: Record<string, string> = { tag };

	ATTRIBUTE_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = ATTRIBUTE_PATTERN.exec(body)) !== null) {
		attributes[match[1]] = unescapeXmlEntities(match[2]);
	}

	return attributes;
}
