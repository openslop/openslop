"use client";

import type { ReactNode } from "react";
import { Image } from "@/components/ui/icon";
import { isToggleOn } from "@/lib/canvas/types";
import {
	CONTINUITY_ATTR,
	CONTINUITY_FRAMES,
} from "@/lib/connectors/video/start-frame";
import { cn } from "@/lib/utils";
import { AssetTile } from "../asset-tile";
import { TileRow } from "./tile-row";
import {
	ReferenceImagesPopover,
	type ReferenceImagesPopoverProps,
} from "./reference-images-popover";
import {
	usePreviousPictures,
	type PreviousPictures,
} from "./use-previous-pictures";

function caption(previous: PreviousPictures, linked: boolean) {
	if (previous.kind === "loading") return "Loading the previous scene…";
	if (previous.kind === "empty") return previous.reason;
	if (!linked) return "Unlinked from the previous scene";
	return `+${previous.pictures.length} from the previous scene`;
}

export function ContinuityReferencesPopover({
	toggle,
	...popover
}: ReferenceImagesPopoverProps & { toggle: ReactNode }) {
	const linked = isToggleOn(
		popover.element.generationAttributes?.[CONTINUITY_ATTR],
	);
	const previous = usePreviousPictures(popover.element, CONTINUITY_FRAMES);
	const pictures = previous.kind === "ready" ? previous.pictures : [];

	return (
		<ReferenceImagesPopover {...popover} added={linked ? pictures.length : 0}>
			<section className="mt-1 border-t border-border pt-3">
				<div className="mb-2 flex items-center justify-between gap-2">
					<p className="text-label text-muted-foreground">
						{caption(previous, linked)}
					</p>
					{toggle}
				</div>
				{pictures.length > 0 && (
					<div className={cn("transition-opacity", !linked && "opacity-40")}>
						<TileRow>
							{pictures.map(({ name, url }) => (
								<AssetTile
									key={url}
									name={name}
									previewUrl={url}
									context="Continuity"
									Icon={Image}
								/>
							))}
						</TileRow>
					</div>
				)}
			</section>
		</ReferenceImagesPopover>
	);
}
