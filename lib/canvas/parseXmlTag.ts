import { unescapeXml } from "./xmlEscape";

/** An OSML open tag split into its name and its attributes. */
export type XmlTag = {
	tag: string;
	attributes: Record<string, string>;
};

const ATTRIBUTE_PATTERN = /(\w+)="([^"]*)"/g;

export function parseXmlTag(tagString: string): XmlTag {
	const trimmed = tagString.trim();
	const attributes = Object.fromEntries(
		Array.from(trimmed.matchAll(ATTRIBUTE_PATTERN), ([, key, value]) => [
			key,
			unescapeXml(value),
		]),
	);
	const [rawTag = ""] = trimmed.split(/\s/, 1);
	return { tag: rawTag.replace(/\/$/, ""), attributes };
}
