import { Element, Node } from "slate";
import { nanoid } from "nanoid";

export const makeNodeId = () => nanoid(16);

/** Drops the ids a copy must not share. */
export const stripIds = (node: Node): Node => {
	if (!Element.isElement(node)) return { ...node };
	const children = node.children.map(stripIds);
	const { id: _, ...rest } = node;
	return { ...rest, children } as Element;
};

export const assignIdRecursively = (node: Node) => {
	if (Element.isElement(node)) {
		node.id ||= makeNodeId();
		node.children.forEach(assignIdRecursively);
	}
};
