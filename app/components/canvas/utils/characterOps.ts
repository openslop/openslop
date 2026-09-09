import type { Editor } from "slate";
import without from "lodash/without";
import xor from "lodash/xor";
import {
	CHARACTERS_ATTR,
	formatCharacterNames,
	getElementCharacterNames,
} from "@/lib/canvas/characterNames";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { updateElementAttrs } from "./nodeOps";

function writeCharacters(
	editor: Editor,
	element: CanvasContentElement,
	names: string[],
): void {
	updateElementAttrs(editor, element, {
		[CHARACTERS_ATTR]: formatCharacterNames(names),
	});
}

export function toggleCharacter(
	editor: Editor,
	element: CanvasContentElement,
	name: string,
): void {
	writeCharacters(
		editor,
		element,
		xor(getElementCharacterNames(element), [name]),
	);
}

export function removeCharacter(
	editor: Editor,
	element: CanvasContentElement,
	name: string,
): void {
	writeCharacters(
		editor,
		element,
		without(getElementCharacterNames(element), name),
	);
}

export function setCharacterName(
	editor: Editor,
	element: CanvasContentElement,
	name: string,
): void {
	updateElementAttrs(editor, element, { name });
}
