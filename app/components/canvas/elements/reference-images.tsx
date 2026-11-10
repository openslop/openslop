"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "@/components/ui/icon";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { AddMediaMenu } from "./add-media-menu";
import { ReferenceTile } from "./asset-tiles";
import { TileRow } from "./attributes/tile-row";
import { uploadingTiles } from "./uploading-tile";

export const NoReferenceImages = () => (
	<EmptyState
		icon={Search}
		title="No reference images yet"
		description="Reference images you add show up here"
	/>
);

/** Uploads reference images to `onAdd`: the menu goes in a header, the input beside the tiles. */
export function useReferenceUpload(onAdd: (urls: string[]) => void) {
	const { openPicker, uploadingCount, inputElement } = useMediaUpload({
		kinds: ["image"],
		multiple: true,
		onUpload: onAdd,
	});
	return {
		addMenu: <AddMediaMenu label="Add reference image" onUpload={openPicker} />,
		uploadingCount,
		inputElement,
	};
}

/** A caller-owned list of reference images as tiles, or the empty state when there are none. */
export function ReferenceImageTiles({
	urls,
	uploadingCount = 0,
	onRemove,
	columns,
}: {
	urls: string[];
	uploadingCount?: number;
	onRemove: (index: number) => void;
	columns?: 2;
}) {
	if (urls.length === 0 && uploadingCount === 0) return <NoReferenceImages />;
	return (
		<TileRow columns={columns}>
			{urls.map((url, index) => (
				<ReferenceTile
					key={`reference:${url}`}
					url={url}
					index={index}
					onRemove={() => onRemove(index)}
				/>
			))}
			{uploadingTiles(uploadingCount)}
		</TileRow>
	);
}
