import { Editor, Transforms } from "slate";
import type { CanvasElementType } from "../types";
import { makeNodeId } from "./nodeUtils";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";

export function insertElement(
  editor: Editor,
  type: CanvasElementType,
  atIndex: number,
) {
  const config = ELEMENT_CONFIGS[type];
  Transforms.insertNodes(
    editor,
    {
      type,
      id: makeNodeId(),
      customAttributes: config.defaultAttributes,
      children: [
        { id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
        { id: makeNodeId(), type, text: "" },
      ],
    },
    { at: [atIndex] },
  );
}
