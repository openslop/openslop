import { Element, Node } from "slate";
import { nanoid } from "nanoid";
import type { CanvasElementType } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { ZERO_WIDTH_SPACE } from "../config/constants";

export const makeNodeId = () => nanoid(16);

export function createElementNode(type: CanvasElementType) {
  const config = ELEMENT_CONFIGS[type];
  return {
    type,
    id: makeNodeId(),
    customAttributes: config.defaultAttributes,
    children: [
      { id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
      { id: makeNodeId(), type, text: "" },
    ],
  };
}

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
