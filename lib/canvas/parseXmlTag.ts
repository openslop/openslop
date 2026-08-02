import { unescapeXml } from "./xmlEscape";

/** An OSML open tag split into its name and its attributes. */
export type XmlTag = {
	tag: string;
	attributes: Record<string, string>;
};

export function parseXmlTag(tagString: string): XmlTag {
	const [rawTag, ...rest] = tagString.trim().split(/\s+/);
	const attributesString = rest.join(" ");
	const attributes: Record<string, string> = {};
	const regex = /(\w+)="([^"]*)"/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(attributesString)) !== null) {
		attributes[match[1]] = unescapeXml(match[2]);
	}

	return { tag: rawTag.replace(/\/$/, ""), attributes };
}
