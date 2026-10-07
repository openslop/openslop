import { Transforms, type Node } from "slate";
import { isAssetElement } from "@/lib/canvas/guards";
import type { CanvasEditor } from "@/lib/canvas/types";

const duplicateAt = (children: Node[]) =>
	children.findIndex(
		(node, at) =>
			isAssetElement(node) &&
			children.findIndex(
				(other) => isAssetElement(other) && other.id === node.id,
			) < at,
	);

const strayAt = (children: Node[]) =>
	children.findIndex(
		(node, at) =>
			isAssetElement(node) && at > 0 && !isAssetElement(children[at - 1]),
	);

/** Every asset is a void tile, one per id, ahead of the script. */
export const withAssets = (editor: CanvasEditor): CanvasEditor => {
	const { isVoid, normalizeNode } = editor;

	editor.isVoid = (element) => isAssetElement(element) || isVoid(element);

	editor.normalizeNode = (entry) => {
		const [node, path] = entry;
		if (isAssetElement(node) && path.length > 1)
			return Transforms.moveNodes(editor, { at: path, to: path.slice(0, 1) });
		if (path.length === 0) {
			const duplicate = duplicateAt(editor.children);
			if (duplicate >= 0)
				return Transforms.removeNodes(editor, { at: [duplicate] });
			const stray = strayAt(editor.children);
			if (stray >= 0)
				return Transforms.moveNodes(editor, { at: [stray], to: [0] });
		}
		normalizeNode(entry);
	};

	return editor;
};
