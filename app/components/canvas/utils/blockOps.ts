import { type Editor, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import type { CanvasBlock } from "@/lib/canvas/types";

export function removeBlock(editor: Editor, block: CanvasBlock): void {
	Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, block) });
}
