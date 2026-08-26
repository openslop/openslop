import { Descendant } from "slate";
import type { CanvasContentElement, ParsedElement } from "@/lib/canvas/types";
import { getContentElements, isSceneElement } from "@/lib/canvas/scenes";
import { isContentElement } from "@/lib/canvas/guards";
import { withoutCaretMarker } from "./constants";
import { flatAttributes } from "@/lib/video/elementAttributes";
import { escapeXml } from "./xmlEscape";

const sceneMarker = (n: number) => `\n--- Scene ${n} ---\n`;

export function getElementText(element: ParsedElement): string {
	return element.children.map((child) => child.text ?? "").join("");
}

/** What the user actually typed, with the caret marker leaf left behind. */
export function getElementBodyText(element: ParsedElement): string {
	return withoutCaretMarker(getElementText(element));
}

function serializeElement(element: CanvasContentElement): string {
	const attrString = Object.entries({
		id: element.id,
		...flatAttributes(element),
	})
		.map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
		.join("");
	return `<${element.type}${attrString}>${escapeXml(getElementBodyText(element))}</${element.type}>\n`;
}

export function serializeOSML(descendants: Descendant[]): string {
	return getContentElements(descendants).map(serializeElement).join("").trim();
}

/**
 * The single OSML entry point for a whole document or an arbitrary fragment:
 * scene nodes emit `--- Scene N ---` markers, and content elements outside a
 * scene (a partial clipboard selection) emit bare tags rather than being dropped.
 */
export function serializeOSMLWithScenes(descendants: Descendant[]): string {
	let osml = "";
	let sceneNum = 0;
	for (const node of descendants) {
		if (isSceneElement(node)) {
			sceneNum++;
			osml += sceneMarker(sceneNum);
			for (const child of node.children) {
				osml += serializeElement(child);
			}
		} else if (isContentElement(node)) {
			osml += serializeElement(node);
		}
	}
	return osml.trim();
}
