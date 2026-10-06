"use client";

import { NARRATOR } from "@/lib/canvas/assets";
import { useAsset } from "@/lib/canvas/useAssets";
import { ArtStyleAssetTile, NarratorTile } from "./AssetTiles";

export function AssetActions() {
	const hasArtStyle = useAsset("asset_style") !== undefined;
	const hasNarrator = useAsset("asset_character", NARRATOR) !== undefined;
	return (
		<section
			contentEditable={false}
			aria-label="Assets"
			className="mb-2 select-none"
		>
			<h2 className="mb-2 text-badge font-medium text-muted-foreground">
				Assets
			</h2>
			<div className="flex flex-wrap gap-2">
				{!hasArtStyle && <ArtStyleAssetTile />}
				{!hasNarrator && <NarratorTile />}
			</div>
		</section>
	);
}
