import { unescapeXml } from "./xml-escape";
import { at } from "@/lib/utils";

/** An OSML open tag split into its name and its attributes. */
export type XmlTag = {
	tag: string;
	attributes: Record<string, string>;
};

const ATTRIBUTE_PATTERN = /(\w+)="([^"]*)"/g;

export function parseXmlTag(tagString: string): XmlTag {
	const trimmed = tagString.trim();
	const attributes = Object.fromEntries(
		Array.from(trimmed.matchAll(ATTRIBUTE_PATTERN), (match) => [
			at(match, 1),
			unescapeXml(at(match, 2)),
		]),
	);
	const [rawTag = ""] = trimmed.split(/\s/, 1);
	return { tag: rawTag.replace(/\/$/, ""), attributes };
}
