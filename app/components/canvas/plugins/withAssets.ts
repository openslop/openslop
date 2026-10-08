import { Editor, Range, Transforms, type Node, type Point } from "slate";
import { isAsset } from "@/lib/canvas/assets";
import { isAssetElement } from "@/lib/canvas/guards";
import type { CanvasEditor } from "@/lib/canvas/types";

const duplicateAt = (children: Node[]) =>
	children.findIndex(
		(node, at) =>
			isAssetElement(node) &&
			children
				.slice(0, at)
				.some((earlier) =>
					isAsset(earlier, node.type, node.generationAttributes?.name),
				),
	);

const strayAt = (children: Node[]) =>
	children.findIndex(
		(node, at) =>
			isAssetElement(node) && at > 0 && !isAssetElement(children[at - 1]),
	);

/** Every asset is a void, one per id, ahead of the script and out of the caret's reach. */
export const withAssets = (editor: CanvasEditor): CanvasEditor => {
	const { isVoid, normalizeNode, onChange, deleteBackward } = editor;

	const inAsset = (point: Point | undefined) =>
		isAssetElement(editor.children[point?.path[0] ?? -1]);
	const caret = () =>
		editor.selection && Range.isCollapsed(editor.selection)
			? editor.selection.anchor
			: undefined;

	editor.isVoid = (element) => isAssetElement(element) || isVoid(element);

	editor.onChange = (options) => {
		if (inAsset(caret())) {
			const script = editor.children.findIndex((node) => !isAssetElement(node));
			Transforms.select(editor, Editor.start(editor, [script]));
		}
		onChange(options);
	};

	editor.deleteBackward = (unit) => {
		const at = caret();
		if (!at || !inAsset(Editor.before(editor, at))) deleteBackward(unit);
	};

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
