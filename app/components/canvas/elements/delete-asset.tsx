import { Transforms, type Editor } from "slate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { findAsset } from "@/lib/canvas/assets";
import { removeAsset, removeCharacter } from "@/lib/canvas/asset-ops";

/** Says what was deleted, with the Undo that puts it back. */
function toastDeleted(message: string, restore: () => void): void {
	const id = toast(message, {
		action: (
			<Button
				variant="secondary"
				size="sm"
				onClick={() => {
					restore();
					toast.dismiss(id);
				}}
			>
				Undo
			</Button>
		),
	});
}

export function deleteCharacter(editor: Editor, name: string): void {
	toastDeleted(`Deleted ${name}`, removeCharacter(editor, name));
}

export function deleteArtStyle(editor: Editor): void {
	const style = findAsset(editor.children, "asset_style");
	if (!style) throw new Error("There is no art style to delete");
	removeAsset(editor, "asset_style");
	toastDeleted("Deleted the art style", () =>
		Transforms.insertNodes(editor, style, { at: [0] }),
	);
}
