"use client";

import { useReferenceImages } from "@/app/components/canvas/hooks/use-reference-images";
import { FieldHeader, FieldLabel } from "../character/fields";
import { ReferenceImageTiles, useReferenceUpload } from "../reference-images";

/** The project's reference images, with the menu that adds more. */
export function ReferenceImages() {
	const { urls, add, remove } = useReferenceImages();
	const { addMenu, uploadingCount, inputElement } = useReferenceUpload(add);
	return (
		<section aria-label="Reference images" className="flex flex-col gap-2">
			<FieldHeader aside={addMenu}>
				<FieldLabel>Reference images</FieldLabel>
			</FieldHeader>
			<ReferenceImageTiles
				urls={urls}
				uploadingCount={uploadingCount}
				onRemove={remove}
			/>
			{inputElement}
		</section>
	);
}
