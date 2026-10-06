import { Editor, Element, type Location, type Node } from "slate";
import { isAssetElement, isHeadElement } from "@/lib/canvas/guards";
import type { CanvasEditor } from "@/lib/canvas/types";

/** The title and the asset tiles stay whole: nothing splits them or merges into them, and every asset is a void. */
export const withHead = (editor: CanvasEditor): CanvasEditor => {
	const { isVoid, mergeNodes, insertBreak, insertFragment } = editor;

	const isBlock = (node: Node) =>
		Element.isElement(node) && Editor.isBlock(editor, node);
	const mergesIntoHead = (at: Location) => {
		const [block] = Editor.nodes(editor, {
			at,
			match: isBlock,
			mode: "lowest",
		});
		const previous =
			block &&
			Editor.previous(editor, { at: block[1], match: isBlock, mode: "lowest" });
		return isHeadElement(previous?.[0]);
	};
	const inHead = () =>
		isHeadElement(
			editor.selection &&
				editor.children[editor.selection.anchor.path[0] ?? -1],
		);

	editor.isVoid = (element) => isAssetElement(element) || isVoid(element);

	editor.mergeNodes = (options = {}) => {
		const at = options.at ?? editor.selection;
		if (!at || !mergesIntoHead(at)) mergeNodes(options);
	};

	// The document already holds a pasted tile's id; a pasted title is only text.
	editor.insertFragment = (fragment) => {
		insertFragment(fragment.filter((node) => !isAssetElement(node)));
	};

	editor.insertBreak = () => {
		if (!inHead()) insertBreak();
	};

	editor.insertSoftBreak = () => {
		if (!inHead()) editor.insertText("\n");
	};

	return editor;
};
