import { Editor, Element, type Location, type Node } from "slate";
import { isAssetElement } from "@/lib/canvas/guards";
import { ASSET_TYPES, type CanvasEditor } from "@/lib/canvas/types";

/** Every asset but the title is a tile: a void the caret selects whole and a delete removes. */
export const withAssets = (editor: CanvasEditor): CanvasEditor => {
	const { isVoid, mergeNodes, insertBreak, insertFragment } = editor;

	const isBlock = (node: Node) =>
		Element.isElement(node) && Editor.isBlock(editor, node);
	const mergesIntoAsset = (at: Location) => {
		const [block] = Editor.nodes(editor, {
			at,
			match: isBlock,
			mode: "lowest",
		});
		const previous =
			block &&
			Editor.previous(editor, { at: block[1], match: isBlock, mode: "lowest" });
		return isAssetElement(previous?.[0]);
	};

	editor.isVoid = (element) =>
		(isAssetElement(element) && !ASSET_TYPES[element.type].editable) ||
		isVoid(element);

	editor.mergeNodes = (options = {}) => {
		const at = options.at ?? editor.selection;
		if (!at || !mergesIntoAsset(at)) mergeNodes(options);
	};

	// The document already holds a pasted tile's id; a pasted title is only text.
	editor.insertFragment = (fragment) => {
		insertFragment(
			fragment.filter((n) => !(Element.isElement(n) && editor.isVoid(n))),
		);
	};

	editor.insertBreak = () => {
		const { selection } = editor;
		const block = selection && editor.children[selection.anchor.path[0] ?? -1];
		if (!isAssetElement(block)) insertBreak();
	};

	return editor;
};
