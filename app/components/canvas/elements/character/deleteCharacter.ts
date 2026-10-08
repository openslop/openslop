import type { Editor } from "slate";
import { toast } from "sonner";
import { removeCharacter } from "@/lib/canvas/assetOps";

export function deleteCharacter(editor: Editor, name: string): void {
	const restore = removeCharacter(editor, name);
	toast(`Deleted ${name}`, { action: { label: "Undo", onClick: restore } });
}
