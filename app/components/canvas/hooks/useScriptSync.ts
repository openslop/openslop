import { useEffect } from "react";
import { Editor, Transforms } from "slate";
import { useScriptNodes } from "@/lib/script/ScriptProvider";
import {
	CANVAS_ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
	type ParsedElement,
} from "@/lib/canvas/types";
import { OSMLSerializer } from "@/lib/canvas/osmlSerializer";
import { findNodeById, updateNodeText } from "@/lib/canvas/editorOps";

function shouldSkip(node: ParsedElement): boolean {
	return (
		!CANVAS_ELEMENT_TYPES.has(node.type as CanvasElementType) ||
		OSMLSerializer.getTextContent(node).length === 0
	);
}

export function useScriptSync(editor: Editor): void {
	const nodes = useScriptNodes();

	useEffect(() => {
		// `nodes` is capped at MAX_NODES_TO_SYNC (3) by useOSMLSerializer,
		// so per-id lookups here are bounded — no need to prebuild a map.
		Editor.withoutNormalizing(editor, () => {
			for (const node of nodes) {
				if (shouldSkip(node)) continue;

				const canvasNode = node as CanvasContentElement;
				const nextText = OSMLSerializer.getTextContent(canvasNode);
				const entry = findNodeById(editor, canvasNode.id);

				if (entry) {
					const [, path] = entry;
					updateNodeText(editor, path, nextText);
				} else {
					Transforms.insertNodes(editor, canvasNode, {
						at: [editor.children.length],
					});
				}
			}
		});
	}, [nodes, editor]);
}
