import { Element, Node } from "slate";
import { nanoid } from "nanoid";
import { isAssetElement } from "./guards";

export const makeNodeId = () => nanoid(16);

/** Drops the ids a copy must not share; an asset's id names the asset itself, so it stays. */
export const stripIds = (node: Node): Node => {
	if (!Element.isElement(node)) return { ...node };
	const children = node.children.map(stripIds);
	if (isAssetElement(node)) return { ...node, children } as Element;
	const { id: _, ...rest } = node;
	return { ...rest, children } as Element;
};

export const assignIdRecursively = (node: Node) => {
	if (Element.isElement(node)) {
		node.id ||= makeNodeId();
		node.children.forEach(assignIdRecursively);
	}
};
