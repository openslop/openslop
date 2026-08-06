import { Descendant } from "slate";
import type { CanvasContentElement, ParsedElement } from "@/lib/canvas/types";
import { getContentElements, isSceneElement } from "@/lib/canvas/scenes";
import { withoutCaretMarker } from "./constants";
import { escapeXml } from "./xmlEscape";

export const SCENE_MARKER_PATTERN = /^---\s*Scene\s+\d+\s*---\s*$/m;
const sceneMarker = (n: number) => `\n--- Scene ${n} ---\n`;

export function getElementText(element: ParsedElement): string {
	return element.children.map((child) => child.text ?? "").join("");
}

/** What the user actually typed, with the caret marker leaf left behind. */
export function getElementBodyText(element: ParsedElement): string {
	return withoutCaretMarker(getElementText(element));
}

function serializeElement(element: CanvasContentElement): string {
	const attributes = element.customAttributes ?? {};
	const attrString = Object.entries({ id: element.id, ...attributes })
		.map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
		.join("");
	return `<${element.type}${attrString}>${escapeXml(getElementBodyText(element))}</${element.type}>\n`;
}

export function serializeOSML(descendants: Descendant[]): string {
	return getContentElements(descendants).map(serializeElement).join("").trim();
}

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
		}
	}
	return osml.trim();
}
