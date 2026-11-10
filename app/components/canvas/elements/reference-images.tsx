"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "@/components/ui/icon";
import { ReferenceTile } from "./asset-tiles";
import { TileRow } from "./attributes/tile-row";

export const NoReferenceImages = () => (
	<EmptyState
		icon={Search}
		title="No reference images yet"
		description="Reference images you add show up here"
	/>
);

/** A caller-owned list of reference images as tiles, or the empty state when there are none. */
export function ReferenceImageTiles({
	urls,
	onRemove,
	columns,
}: {
	urls: string[];
	onRemove: (index: number) => void;
	columns?: 2;
}) {
	if (urls.length === 0) return <NoReferenceImages />;
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
		</TileRow>
	);
}
