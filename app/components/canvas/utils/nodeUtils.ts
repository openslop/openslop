import { Descendant, Element, Node } from "slate";
import { nanoid } from "nanoid";
import type { CanvasContentElement } from "../types";
import { isSceneElement } from "./guards";

export const makeNodeId = () => nanoid(16);

export const getContentElements = (
  nodes: Descendant[],
): CanvasContentElement[] =>
  nodes.flatMap((node) => (isSceneElement(node) ? node.children : []));

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
