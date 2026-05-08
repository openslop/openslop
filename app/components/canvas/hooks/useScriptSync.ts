import { useEffect } from "react";
import { Editor, Transforms } from "slate";
import { useScript } from "@/lib/script/ScriptProvider";
import {
	CANVAS_ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
} from "../types";
import { OSMLSerializer } from "../utils/osmlSerializer";
import { findNodeById, updateNodeText } from "../utils/editorOps";

export function useScriptSync(editor: Editor): void {
	const { nodes } = useScript();

	useEffect(() => {
		Editor.withoutNormalizing(editor, () => {
			for (const node of nodes) {
				if (!CANVAS_ELEMENT_TYPES.has(node.type as CanvasElementType)) continue;

				const canvasNode = node as CanvasContentElement;
				if (OSMLSerializer.getTextContent(canvasNode).length === 0) continue;

				const entry = findNodeById(editor, canvasNode.id);

				if (entry) {
					const [, path] = entry;
					updateNodeText(
						editor,
						path,
						OSMLSerializer.getTextContent(canvasNode),
					);
				} else {
					Transforms.insertNodes(editor, canvasNode, {
						at: [editor.children.length],
					});
				}
			}
		});
	}, [nodes, editor]);
}
