import { unescapeXml } from "./xmlEscape";

/** An OSML open tag split into its name and its attributes. */
export type XmlTag = {
	tag: string;
	attributes: Record<string, string>;
};

export function parseXmlTag(tagString: string): XmlTag {
	// Slice rather than split/rejoin: whitespace inside an attribute value is
	// part of what the user typed, and collapsing it loses their line breaks.
	const trimmed = tagString.trim();
	const nameEnd = trimmed.search(/\s/);
	const rawTag = nameEnd === -1 ? trimmed : trimmed.slice(0, nameEnd);
	const attributesString = nameEnd === -1 ? "" : trimmed.slice(nameEnd);
	const attributes: Record<string, string> = {};
	const regex = /(\w+)="([^"]*)"/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(attributesString)) !== null) {
		attributes[match[1]] = unescapeXml(match[2]);
	}

	return { tag: rawTag.replace(/\/$/, ""), attributes };
}
