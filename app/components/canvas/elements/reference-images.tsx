"use client";

import { ImagePlus } from "@/components/ui/icon";
import type { UploadTarget } from "@/lib/upload/pending-uploads";
import { useFileUpload } from "@/lib/upload/use-file-upload";
import { AddAssetTile } from "./add-asset-tile";
import { useReferenceImages } from "../hooks/use-reference-images";
import { ReferenceTile } from "./asset-tiles";

/** Reference image tiles for a caller-owned list, plus the tile that uploads more. */
export function ReferenceImagePicker({
	feeds,
	urls,
	onAdd,
	onRemove,
}: {
	feeds: UploadTarget;
	urls: string[];
	onAdd: (urls: string[]) => void;
	onRemove: (index: number) => void;
}) {
	const { openPicker, uploading, inputElement } = useFileUpload({
		kind: "image",
		feeds,
		multiple: true,
		onUpload: onAdd,
	});

	return (
		<>
			{urls.map((url, index) => (
				<ReferenceTile
					key={`reference:${url}`}
					url={url}
					index={index}
					onRemove={() => onRemove(index)}
				/>
			))}
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
	const { urls, add, remove } = useReferenceImages();
	return (
		<ReferenceImagePicker
			feeds="project"
			urls={urls}
			onAdd={add}
			onRemove={remove}
		/>
	);
}
