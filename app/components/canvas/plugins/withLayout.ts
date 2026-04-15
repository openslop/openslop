import type { Editor } from "slate";
import type { CanvasEditor } from "../types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { insertElement } from "../utils/insertElement";

const configStore = new WeakMap<Editor, ConnectorRegistry>();

export function setLayoutConfig(
  editor: CanvasEditor,
  config: ConnectorRegistry,
): void {
  configStore.set(editor, config);
}

export const withLayout = (editor: CanvasEditor): CanvasEditor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0 && editor.children.length < 1) {
      const config = configStore.get(editor);
      if (config) insertElement(editor, "narration", 0, config);
    }
    return normalizeNode([node, path]);
  };

  return editor;
};
