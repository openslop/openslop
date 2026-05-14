import { useEffect } from "react";
import { Editor, type Path, Transforms } from "slate";
import { useScript } from "@/lib/script/ScriptProvider";
import {
	CANVAS_ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
	type ParsedElement,
} from "../types";
import { OSMLSerializer } from "../utils/osmlSerializer";
import { isContentElement } from "../utils/guards";
import { updateNodeText } from "../utils/editorOps";

function shouldSkip(node: ParsedElement): boolean {
	return (
		!CANVAS_ELEMENT_TYPES.has(node.type as CanvasElementType) ||
		OSMLSerializer.getTextContent(node).length === 0
	);
}

export function useScriptSync(editor: Editor): void {
	const { nodes } = useScript();

	useEffect(() => {
		Editor.withoutNormalizing(editor, () => {
			const pathById = new Map<string, Path>();
			for (const [node, path] of Editor.nodes<CanvasContentElement>(editor, {
				at: [],
				match: isContentElement,
			})) {
				pathById.set(node.id, path);
			}

			for (const node of nodes) {
				if (shouldSkip(node)) continue;

				const canvasNode = node as CanvasContentElement;
				const path = pathById.get(canvasNode.id);

				if (path) {
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
