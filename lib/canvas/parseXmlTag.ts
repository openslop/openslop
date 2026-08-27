import { unescapeXml } from "./xmlEscape";

/** An OSML open tag split into its name and its attributes. */
export type XmlTag = {
	tag: string;
	attributes: Record<string, string>;
};

const ATTRIBUTE_PATTERN = /(\w+)="([^"]*)"/g;

export function parseXmlTag(tagString: string): XmlTag {
	const trimmed = tagString.trim();
	const attributes: Record<string, string> = {};
	ATTRIBUTE_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = ATTRIBUTE_PATTERN.exec(trimmed)) !== null) {
		attributes[match[1]] = unescapeXml(match[2]);
	}

	const [rawTag = ""] = trimmed.split(/\s/, 1);
	return { tag: rawTag.replace(/\/$/, ""), attributes };
}
