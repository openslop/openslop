import { Editor, Path, Transforms } from "slate";
import type { CanvasElementType } from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { makeNodeId } from "./nodeUtils";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { hydrateConnectorConfig } from "./hydrateConnectorConfig";

export function insertElement(
  editor: Editor,
  type: CanvasElementType,
  at: Path,
  connectors: ConnectorRegistry,
  overrides?: { attrs?: Record<string, string>; text?: string },
): string {
  const config = ELEMENT_CONFIGS[type];
  const id = makeNodeId();
  const baseNode = {
    type,
    id,
    customAttributes: overrides?.attrs ?? config.defaultAttributes,
    children: [
      { id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
      { id: makeNodeId(), type, text: overrides?.text ?? "" },
    ],
  };
  Transforms.insertNodes(editor, hydrateConnectorConfig(connectors)(baseNode), {
    at,
  });
  return id;
}
