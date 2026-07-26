import { unescapeXmlAttribute } from "./xmlAttributes";

const ATTRIBUTE_PATTERN = /(\w+)="([^"]*)"/g;

export function parseXmlTag(tagString: string): Record<string, string> {
	const trimmed = tagString.trim();
	const [rawTag] = trimmed.split(/\s+/);
	const tag = rawTag.replace(/\/$/, "");
	const attributes: Record<string, string> = { tag };

	for (const [, key, value] of trimmed
		.slice(rawTag.length)
		.matchAll(ATTRIBUTE_PATTERN)) {
		attributes[key] = unescapeXmlAttribute(value);
	}

	return attributes;
}
