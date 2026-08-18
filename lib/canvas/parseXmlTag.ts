import { unescapeXml } from "./xmlEscape";

/** An OSML open tag split into its name and its attributes. */
export type XmlTag = {
	tag: string;
	attributes: Record<string, string>;
};

const ATTRIBUTE = /(\w+)="([^"]*)"/g;

export function parseXmlTag(tagString: string): XmlTag {
	const trimmed = tagString.trim();
	// Slice the name off rather than splitting the whole tag on whitespace:
	// rejoining the rest collapses runs of spaces and newlines inside a value.
	const nameEnd = trimmed.search(/\s/);
	const rawTag = nameEnd === -1 ? trimmed : trimmed.slice(0, nameEnd);
	const attributesString = nameEnd === -1 ? "" : trimmed.slice(nameEnd);
	const attributes: Record<string, string> = {};

	ATTRIBUTE.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = ATTRIBUTE.exec(attributesString)) !== null) {
		attributes[match[1]] = unescapeXml(match[2]);
	}

	return { tag: rawTag.replace(/\/$/, ""), attributes };
}
