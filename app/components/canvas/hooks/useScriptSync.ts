import { useEffect } from "react";
import { Editor, Transforms, Descendant } from "slate";
import flow from "lodash/fp/flow";
import { useScript } from "@/lib/script/ScriptProvider";
import { useConfig, type ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import type { CanvasElement } from "../types";
import { OSMLSerializer } from "../utils/osmlSerializer";

export function useScriptSync(
  editor: Editor,
  setValue: (value: Descendant[]) => void,
): void {
  const { nodes } = useScript();
  const { connectors } = useConfig();

  const normalize = flow(trimWhitespace, hydrateModel(connectors));

  useEffect(() => {
    Editor.withoutNormalizing(editor, () => {
      for (const node of nodes) {
        const normalized = normalize(node as CanvasElement);
        if (shouldSkipNode(normalized)) continue;

        const [entry] = Editor.nodes(editor, {
          at: [],
          match: (n) => n.id === node.id,
        });

        if (entry) {
          const [, path] = entry;
          const currentText = Editor.string(editor, path);
          const newText = OSMLSerializer.getTextContent(normalized);
          if (newText.startsWith(currentText)) {
            const diff = newText.substring(currentText.length);
            if (diff) {
              Transforms.insertText(editor, diff, {
                at: Editor.end(editor, path),
              });
            }
          }
        } else {
          Transforms.insertNodes(editor, normalized, {
            at: [editor.children.length],
          });
        }
      }
    });
  }, [nodes, editor, setValue, normalize]);
}

function trimWhitespace(node: CanvasElement): CanvasElement {
  const clone = structuredClone(node);
  for (const child of clone.children) {
    child.text = child.text.trim();
  }
  return clone;
}

function hydrateModel(connectors: ConnectorRegistry) {
  return (node: CanvasElement): CanvasElement => {
    const connectorType = ELEMENT_CONFIGS[node.type]?.connector;
    const model = connectors[connectorType]?.model;
    if (!model) return node;
    return {
      ...node,
      customAttributes: { ...node.customAttributes, model },
    };
  };
}

function shouldSkipNode(node: CanvasElement): boolean {
  return OSMLSerializer.getTextContent(node).length === 0;
}
