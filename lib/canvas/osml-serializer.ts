import { Descendant } from "slate";
import { characterRef } from "@/lib/connectors/character-refs";
import type { CanvasElement } from "./types";
import { isScene } from "./scenes";
import { isAssetElement, isCharacterRef } from "./guards";
import { sceneMarker, withoutCaretMarker } from "./constants";
import { flatAttributes } from "./element-attributes";
import { escapeXml } from "./xml-escape";

export function getElementText(element: CanvasElement): string {
	return element.children
		.map((child) =>
			isCharacterRef(child) ? characterRef(child.name) : child.text,
		)
		.join("");
}

/** What the user actually typed, with the caret marker leaf left behind. */
export function getElementBodyText(element: CanvasElement): string {
	return withoutCaretMarker(getElementText(element));
}

/** One element as its OSML tag: the id first, then its attributes, around what the user typed. */
export function serializeElement(element: CanvasElement): string {
	const attrString = Object.entries({
		id: element.id,
		...flatAttributes(element),
	})
		.map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
		.join("");
	return `<${element.type}${attrString}>${escapeXml(getElementBodyText(element))}</${element.type}>`;
}

/** The whole document: the assets, then each scene under its marker. */
export function serializeOSMLWithScenes(descendants: Descendant[]): string {
	const assets = descendants.filter(isAssetElement).map(serializeElement);
	const scenes = descendants
		.filter(isScene)
		.map(
			(scene, index) =>
				sceneMarker(index + 1) +
				scene.children.map(serializeElement).join("\n"),
		);
	return [...assets, ...scenes].join("\n").trim();
}
