import { Descendant } from "slate";
import type { CanvasContentElement, ParsedElement } from "./types";
import { getContentElements, isSceneElement } from "./scenes";
import { withoutCaretMarker } from "./constants";
import { flatAttributes } from "./elementAttributes";
import { escapeXml } from "./xmlEscape";

const sceneMarker = (sceneNumber: number) => `\n--- Scene ${sceneNumber} ---\n`;

export function getElementText(element: ParsedElement): string {
	return element.children.map((child) => child.text).join("");
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

export function serializeOSMLWithScenes(descendants: Descendant[]): string {
	return descendants
		.filter(isSceneElement)
		.map(
			(scene, index) =>
				sceneMarker(index + 1) + scene.children.map(serializeElement).join(""),
		)
		.join("")
		.trim();
}
