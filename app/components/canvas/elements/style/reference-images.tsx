"use client";

import { AddButton } from "@/components/ui/add-button";
import { useReferenceImages } from "@/app/components/canvas/hooks/use-reference-images";
import { FieldHeader, FieldLabel } from "../character/fields";
import { MediaPicker } from "../media-picker";
import { ReferenceImageTiles } from "../reference-images";

/** The project's reference images, added from the media picker like an element's. */
export function ReferenceImages() {
	const { urls, add, remove } = useReferenceImages();
	return (
		<section aria-label="Reference images" className="flex flex-col gap-2">
			<FieldHeader
				aside={
					<MediaPicker kind="image" onPick={(url) => add([url])}>
						<AddButton label="Add reference image" />
					</MediaPicker>
				}
			>
				<FieldLabel>Reference images</FieldLabel>
			</FieldHeader>
			<ReferenceImageTiles urls={urls} onDelete={remove} />
		</section>
	);
}
