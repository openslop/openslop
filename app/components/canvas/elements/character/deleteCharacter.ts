import type { Editor } from "slate";
import { toast } from "sonner";
import { removeCharacter, restoreAssets } from "@/lib/canvas/assetOps";

export function deleteCharacter(editor: Editor, name: string): void {
	const removed = removeCharacter(editor, name);
	toast(`Deleted ${name}`, {
		action: { label: "Undo", onClick: () => restoreAssets(editor, removed) },
	});
}
