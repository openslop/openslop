"use client";

import { Transforms, type Editor } from "slate";
import { toast } from "sonner";
import { useSlateStatic } from "slate-react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "@/components/ui/icon";
import { findAsset } from "@/lib/canvas/assets";
import { removeAsset, removeNamedAsset } from "@/lib/canvas/asset-ops";

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

export function deleteNamedAsset(editor: Editor, name: string): void {
	toastDeleted(`Deleted ${name}`, removeNamedAsset(editor, name));
}

export function deleteArtStyle(editor: Editor): void {
	const style = findAsset(editor.children, "asset_style");
	if (!style) throw new Error("There is no art style to delete");
	removeAsset(editor, "asset_style");
	toastDeleted("Deleted the art style", () =>
		Transforms.insertNodes(editor, style, { at: [0] }),
	);
}

export function DeleteNamedAssetButton({
	name,
	onDeleted,
}: {
	name: string;
	onDeleted: () => void;
}) {
	const editor = useSlateStatic();
	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			onClick={() => {
				deleteNamedAsset(editor, name);
				onDeleted();
			}}
			className="text-muted-foreground sm:mr-auto"
		>
			<Trash2 />
			Delete
		</Button>
	);
}
