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
) {
  const config = ELEMENT_CONFIGS[type];
  const baseNode = {
    type,
    id: makeNodeId(),
    customAttributes: config.defaultAttributes,
    children: [
      { id: makeNodeId(), type, text: ZERO_WIDTH_SPACE },
      { id: makeNodeId(), type, text: "" },
    ],
  };
  Transforms.insertNodes(editor, hydrateConnectorConfig(connectors)(baseNode), {
    at,
  });
}
