import { Editor, Text, Transforms, type Path } from "slate";
import { createNameRef } from "@/lib/canvas/name-refs";
import {
	takesNameRefs,
	isNameRef,
	isContentElement,
} from "@/lib/canvas/guards";
import { makeNodeId } from "@/lib/canvas/node-utils";
import type { CanvasEditor, ContentElement } from "@/lib/canvas/types";
import { findNameRef } from "@/lib/connectors/name-refs";

export const withNameRefs = (editor: CanvasEditor): CanvasEditor => {
	const { isInline, isVoid, normalizeNode } = editor;

	editor.isInline = (element) => isNameRef(element) || isInline(element);
	editor.isVoid = (element) => isNameRef(element) || isVoid(element);

	const chip = ({ children }: ContentElement, path: Path) => {
		for (const [index, child] of children.entries()) {
			const found = Text.isText(child) && findNameRef(child.text);
			if (!found) continue;
			const at = { path: [...path, index], offset: found.start };
			Transforms.delete(editor, {
				at: { anchor: at, focus: { ...at, offset: found.end } },
			});
			Transforms.insertNodes(editor, createNameRef(found.name), { at });
			return true;
		}
		return false;
	};

	const unchip = ({ children }: ContentElement, path: Path) => {
		for (const [index, child] of children.entries()) {
			if (!isNameRef(child)) continue;
			const at = [...path, index];
			Editor.withoutNormalizing(editor, () => {
				Transforms.removeNodes(editor, { at });
				Transforms.insertNodes(
					editor,
					{ id: makeNodeId(), text: child.name },
					{ at },
				);
			});
			return true;
		}
		return false;
	};

	editor.normalizeNode = (entry, options) => {
		const [node, path] = entry;
		if (isContentElement(node)) {
			const fix = takesNameRefs(node) ? chip : unchip;
			if (fix(node, path)) return;
		}
		normalizeNode(entry, options);
	};

	return editor;
};
