import { Editor, Node, Transforms } from "slate";
import { isTitleElement } from "./guards";
import { makeNodeId } from "./nodeUtils";
import { TITLE_TYPE, type TitleElement } from "./types";

export const createTitle = (text = ""): TitleElement => ({
	id: TITLE_TYPE,
	type: TITLE_TYPE,
	children: [{ id: makeNodeId(), type: TITLE_TYPE, text }],
});

export const titleText = (nodes: readonly unknown[]): string => {
	const title = nodes.find(isTitleElement);
	return title ? Node.string(title) : "";
};

/** Writes the title, adding it at the top when there is none. */
export function setTitle(editor: Editor, text: string): void {
	const at = editor.children.findIndex(isTitleElement);
	if (at < 0) {
		Transforms.insertNodes(editor, createTitle(text), { at: [0] });
		return;
	}
	Transforms.insertText(editor, text, { at: Editor.range(editor, [at]) });
}
