import { useEffect } from "react";
import { Editor, Transforms } from "slate";
import { useScriptNodes } from "@/lib/script/ScriptProvider";
import { findNodeById, updateNodeText } from "@/lib/canvas/editorOps";
import { isParsedContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";

export function useScriptSync(editor: Editor): void {
	const nodes = useScriptNodes();

	useEffect(() => {
		Editor.withoutNormalizing(editor, () => {
			for (const node of nodes) {
				if (!isParsedContentElement(node)) continue;

				const nextText = getElementBodyText(node);
				if (!nextText) continue;

				const entry = findNodeById(editor, node.id);
				if (entry) {
					const [, path] = entry;
					updateNodeText(editor, path, nextText);
				} else {
					Transforms.insertNodes(editor, node, {
						at: [editor.children.length],
					});
				}
			}
		});
	}, [nodes, editor]);
}
