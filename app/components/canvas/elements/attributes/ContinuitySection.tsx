"use client";

import type { ReactNode } from "react";
import { Image } from "@/components/ui/icon";
import {
	CONTINUITY_ATTR,
	CONTINUITY_FRAMES,
} from "@/lib/connectors/video/startFrame";
import { cn } from "@/lib/utils";
import { AssetTile } from "../AssetTile";
import {
	ReferenceImagesPopover,
	type ReferenceImagesPopoverProps,
} from "./ReferenceImagesPopover";
import {
	usePreviousPictures,
	type PreviousPictures,
} from "./usePreviousPictures";

function caption(previous: PreviousPictures, linked: boolean) {
	if (previous.kind === "loading") return "Loading the previous scene…";
	if (previous.kind === "empty") return previous.reason;
	if (!linked) return "Unlinked from the previous scene";
	return `+${previous.pictures.length} from the previous scene`;
}

/** A video's reference images, counting the pictures continuity adds, with those pictures and the toggle that links them beneath. */
export function ContinuityReferencesPopover({
	toggle,
	...popover
}: ReferenceImagesPopoverProps & { toggle: ReactNode }) {
	const linked =
		popover.element.generationAttributes?.[CONTINUITY_ATTR] === "true";
	const previous = usePreviousPictures(popover.element, CONTINUITY_FRAMES);
	const pictures = previous.kind === "ready" ? previous.pictures : [];

	return (
		<ReferenceImagesPopover {...popover} added={linked ? pictures.length : 0}>
			<section className="mt-3 border-t border-border pt-3">
				<div className="mb-2 flex items-center justify-between gap-2">
					<p className="text-label text-muted-foreground">
						{caption(previous, linked)}
					</p>
					{toggle}
				</div>
				{pictures.length > 0 && (
					<div
						className={cn(
							"flex flex-wrap gap-2 transition-opacity",
							!linked && "opacity-40",
						)}
					>
						{pictures.map(({ name, url }) => (
							<AssetTile key={url} name={name} previewUrl={url} Icon={Image} />
						))}
					</div>
				)}
			</section>
		</ReferenceImagesPopover>
	);
}
