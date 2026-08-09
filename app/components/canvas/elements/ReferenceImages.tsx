"use client";

import { ImagePlus } from "@/components/ui/icon";
import { useProject } from "@/lib/project/useProject";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { AddAssetTile } from "./AddAssetTile";
import { ReferenceAssetTiles } from "./AssetTiles";

/** The project's reference images, plus the tile that adds more. */
export function ReferenceImages() {
	const addReferenceImages = useProject((s) => s.addReferenceImages);
	const { openPicker, uploading, inputElement } = useImageUpload({
		multiple: true,
		onUpload: addReferenceImages,
	});

	return (
		<>
			<ReferenceAssetTiles />
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
