"use client";

import { ImagePlus } from "@/components/ui/icon";
import { useProject } from "@/lib/project/useProject";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { AddAssetTile } from "./AddAssetTile";
import { ReferenceTiles } from "./AssetTiles";

/** Reference image tiles for a caller-owned list, plus the tile that uploads more. */
export function ReferenceImagePicker({
	urls,
	onAdd,
	onRemove,
}: {
	urls: string[];
	onAdd: (urls: string[]) => void;
	onRemove: (index: number) => void;
}) {
	const { openPicker, uploading, inputElement } = useImageUpload({
		multiple: true,
		onUpload: onAdd,
	});

	return (
		<>
			<ReferenceTiles urls={urls} onRemove={onRemove} />
			<AddAssetTile
				label="Reference"
				ariaLabel="Add reference image"
				Icon={ImagePlus}
				onClick={openPicker}
				disabled={uploading}
				busy={uploading}
			/>
			{inputElement}
		</>
	);
}

/** The project's reference images, plus the tile that adds more. */
export function ReferenceImages() {
	const referenceImages = useProject((s) => s.referenceImages);
	const addReferenceImages = useProject((s) => s.addReferenceImages);
	const removeReferenceImage = useProject((s) => s.removeReferenceImage);

	return (
		<ReferenceImagePicker
			urls={referenceImages}
			onAdd={addReferenceImages}
			onRemove={removeReferenceImage}
		/>
	);
}
