import { Descendant } from "slate";
import type { ParsedElement } from "./types";
import { isScene } from "./scenes";
import { isAssetElement } from "./guards";
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

function serializeElement(element: ParsedElement): string {
	const attrString = Object.entries({
		id: element.id,
		...flatAttributes(element),
	})
		.map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
		.join("");
	return `<${element.type}${attrString}>${escapeXml(getElementBodyText(element))}</${element.type}>\n`;
}

/** The whole document: the assets, then each scene under its marker. */
export function serializeOSMLWithScenes(descendants: Descendant[]): string {
	const scenes = descendants
		.filter(isScene)
		.map(
			(scene, index) =>
				sceneMarker(index + 1) + scene.children.map(serializeElement).join(""),
		);
	return [
		...descendants.filter(isAssetElement).map(serializeElement),
		...scenes,
	]
		.join("")
		.trim();
}
