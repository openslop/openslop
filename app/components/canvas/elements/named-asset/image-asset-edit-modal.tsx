"use client";

import { useSlateSelector } from "slate-react";
import { findImageAsset } from "@/lib/canvas/assets";
import { AppearanceEditor } from "./appearance-editor";
import { AssetDialog } from "./asset-dialog";
import { DeleteNamedAssetButton } from "../delete-asset";

/** A location or prop: only its appearance and the image generated from it. */
export function ImageAssetEditModal({
	name,
	onClose,
}: {
	name: string;
	onClose: () => void;
}) {
	const imageAsset = useSlateSelector((editor) =>
		findImageAsset(editor.children, name),
	);
	if (!imageAsset) return null;
	return (
		<AssetDialog
			title={name}
			description="Edits save automatically. Regenerate the image after changing the appearance."
			onClose={onClose}
			actions={<DeleteNamedAssetButton name={name} onDeleted={onClose} />}
		>
			<AppearanceEditor element={imageAsset} modelLabel="Image model" />
		</AssetDialog>
	);
}
