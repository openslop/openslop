import { Element, Node } from "slate";
import { nanoid } from "nanoid";

export const makeNodeId = () => nanoid(16);

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
