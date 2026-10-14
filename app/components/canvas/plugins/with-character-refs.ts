import { Editor, Text, Transforms, type Path } from "slate";
import { createCharacterRef } from "@/lib/canvas/character-refs";
import {
	castsCharacters,
	isCharacterRef,
	isContentElement,
} from "@/lib/canvas/guards";
import { makeNodeId } from "@/lib/canvas/node-utils";
import type { CanvasEditor, ContentElement } from "@/lib/canvas/types";
import { findCharacterRef } from "@/lib/connectors/character-refs";

export const withCharacterRefs = (editor: CanvasEditor): CanvasEditor => {
	const { isInline, isVoid, normalizeNode } = editor;

	editor.isInline = (element) => isCharacterRef(element) || isInline(element);
	editor.isVoid = (element) => isCharacterRef(element) || isVoid(element);

	const chip = ({ children }: ContentElement, path: Path) => {
		const index = children.findIndex(
			(child) => Text.isText(child) && findCharacterRef(child.text),
		);
		const child = children[index];
		const found = Text.isText(child) && findCharacterRef(child.text);
		if (!found) return false;
		const at = { path: [...path, index], offset: found.start };
		Transforms.delete(editor, {
			at: { anchor: at, focus: { ...at, offset: found.end } },
		});
		Transforms.insertNodes(editor, createCharacterRef(found.name), { at });
		return true;
	};

	const unchip = ({ type, children }: ContentElement, path: Path) => {
		const index = children.findIndex(isCharacterRef);
		const ref = children[index];
		if (!isCharacterRef(ref)) return false;
		const at = [...path, index];
		Editor.withoutNormalizing(editor, () => {
			Transforms.removeNodes(editor, { at });
			Transforms.insertNodes(
				editor,
				{ id: makeNodeId(), type, text: ref.name },
				{ at },
			);
		});
		return true;
	};

	editor.normalizeNode = (entry, options) => {
		const [node, path] = entry;
		if (isContentElement(node)) {
			const fix = castsCharacters(node) ? chip : unchip;
			if (fix(node, path)) return;
		}
		normalizeNode(entry, options);
	};

	return editor;
};
