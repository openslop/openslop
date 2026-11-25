"use client";

import { useSlateSelector } from "slate-react";
import { findPicture, kindOfType } from "@/lib/canvas/assets";
import { AppearanceEditor } from "./appearance-editor";
import { AssetDialog } from "./asset-dialog";
import { DeleteAssetButton } from "../delete-asset";

/** A location or prop: only its appearance and the picture drawn from it. */
export function PictureEditModal({
	name,
	onClose,
}: {
	name: string;
	onClose: () => void;
}) {
	const picture = useSlateSelector((editor) =>
		findPicture(editor.children, name),
	);
	if (!picture) return null;
	const kind = kindOfType(picture.type);
	return (
		<AssetDialog
			title={name}
			description="Edits save automatically. Regenerate the picture after changing the appearance."
			onClose={onClose}
			actions={<DeleteAssetButton name={name} onDeleted={onClose} />}
		>
			<AppearanceEditor
				element={picture}
				modelLabel="Image model"
				placeholder={`Describe the ${kind}`}
			/>
		</AssetDialog>
	);
}
