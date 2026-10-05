"use client";

import { AddArtStyleTile, AddNarratorTile } from "./AssetTiles";

export function AssetActions() {
	return (
		<section
			contentEditable={false}
			aria-label="Add assets"
			className="mb-2 select-none"
		>
			<h2 className="mb-2 text-badge font-medium text-muted-foreground">
				Assets
			</h2>
			<div className="flex flex-wrap gap-2">
				<AddArtStyleTile />
				<AddNarratorTile />
			</div>
		</section>
	);
}
