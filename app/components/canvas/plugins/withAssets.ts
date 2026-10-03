import { Editor, Range, type Point, type TextUnit } from "slate";
import { isAssetElement } from "@/lib/canvas/guards";
import { ASSET_TYPES, type CanvasEditor } from "@/lib/canvas/types";

const isLocked = (node: unknown) =>
	isAssetElement(node) && !ASSET_TYPES[node.type].editable;

/** Locked assets are voids the keyboard never reaches; Slate alone would still delete one whole. */
export const withAssets = (editor: CanvasEditor): CanvasEditor => {
	const {
		isVoid,
		isSelectable,
		apply,
		deleteBackward,
		deleteForward,
		deleteFragment,
		insertBreak,
	} = editor;

	const blockAt = ({ path }: Point) => editor.children[path[0] ?? -1];
	const crossesAnAsset = (from: Point, to: Point) =>
		blockAt(from) !== blockAt(to) &&
		(isAssetElement(blockAt(from)) || isAssetElement(blockAt(to)));

	editor.isVoid = (element) => isLocked(element) || isVoid(element);

	editor.isSelectable = (element) =>
		!isLocked(element) && isSelectable(element);

	editor.apply = (operation) => {
		if (operation.type === "set_selection") {
			const next = { ...editor.selection, ...operation.newProperties };
			if (
				Range.isRange(next) &&
				Range.points(next).some(([point]) => isLocked(blockAt(point)))
			)
				return;
		}
		apply(operation);
	};

	const withinItsBlock =
		(remove: (unit: TextUnit) => void, step: typeof Editor.before) =>
		(unit: TextUnit) => {
			const { selection } = editor;
			const target = selection && step(editor, selection, { unit });
			if (!selection || !target || !crossesAnAsset(selection.anchor, target))
				remove(unit);
		};
	editor.deleteBackward = withinItsBlock(deleteBackward, Editor.before);
	editor.deleteForward = withinItsBlock(deleteForward, Editor.after);

	editor.deleteFragment = (direction) => {
		const { selection } = editor;
		if (!selection || !crossesAnAsset(selection.anchor, selection.focus))
			deleteFragment(direction);
	};

	editor.insertBreak = () => {
		const { selection } = editor;
		if (!selection || !isAssetElement(blockAt(selection.anchor))) insertBreak();
	};

	return editor;
};
