import { useEffect, useMemo } from "react";
import { Editor, Transforms } from "slate";
import { useScript } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasContentElement } from "../types";
import { OSMLSerializer } from "../utils/osmlSerializer";
import { hydrateConnectorConfig } from "../utils/hydrateConnectorConfig";
import { findNodeById, updateNodeText } from "../utils/editorOps";
import flow from "lodash/fp/flow";

export function useScriptSync(editor: Editor): void {
  const { nodes } = useScript();
  const { connectorConfig } = useConfig();

  const normalize = useMemo(
    () => flow(trimWhitespace, hydrateConnectorConfig(connectorConfig)),
    [connectorConfig],
  );

  useEffect(() => {
    Editor.withoutNormalizing(editor, () => {
      for (const node of nodes) {
        const normalized = normalize(node as CanvasContentElement);
        if (shouldSkipNode(normalized)) continue;

        const entry = findNodeById(editor, node.id);

        if (entry) {
          const [, path] = entry;
          updateNodeText(
            editor,
            path,
            OSMLSerializer.getTextContent(normalized),
          );
        } else {
          Transforms.insertNodes(editor, normalized, {
            at: [editor.children.length],
          });
        }
      }
    });
  }, [nodes, editor, normalize]);
}

function trimWhitespace(node: CanvasContentElement): CanvasContentElement {
  return {
    ...node,
    children: node.children.map((child) => ({
      ...child,
      text: child.text.trim(),
    })),
  };
}

function shouldSkipNode(node: CanvasContentElement): boolean {
  return OSMLSerializer.getTextContent(node).length === 0;
}
