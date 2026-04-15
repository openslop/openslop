import type { CanvasEditor } from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { insertElement } from "../utils/insertElement";

export const withLayout =
  (connectorConfig: ConnectorRegistry) =>
  (editor: CanvasEditor): CanvasEditor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = ([node, path]) => {
      if (path.length === 0 && editor.children.length < 1) {
        insertElement(editor, "narration", 0, connectorConfig);
      }
      return normalizeNode([node, path]);
    };

    return editor;
  };
