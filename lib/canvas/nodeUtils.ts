import { Editor, Element, Node } from "slate";
import { nanoid } from "nanoid";

export const makeNodeId = () => nanoid(16);

/** Whether any node in the document — element or text — already claims `id`. */
export const isNodeIdTaken = (editor: Editor, id: string): boolean => {
	const [match] = Editor.nodes(editor, {
		at: [],
		match: (n) => !Editor.isEditor(n) && (n as { id?: string }).id === id,
	});
	return match !== undefined;
};

export const stripIds = (node: Node): Node => {
	if (Element.isElement(node)) {
		const { id: _, ...rest } = node;
		return { ...rest, children: node.children.map(stripIds) } as Element;
	}
	return { ...node };
};

export const assignIdRecursively = (node: Node) => {
	if (Element.isElement(node)) {
		if (!node.id) {
			node.id = makeNodeId();
		}
		node.children.forEach(assignIdRecursively);
	}
};
