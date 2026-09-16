"use client";

import type { ReactNode } from "react";
import { Image } from "@/components/ui/icon";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	CONTINUITY_ATTR,
	isLinked,
	parseStartFrame,
	splitPrevious,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/startFrame";
import { cn } from "@/lib/utils";
import { AssetTile } from "../AssetTile";
import {
	ReferenceImagesPopover,
	type ReferenceImagesPopoverProps,
} from "./ReferenceImagesPopover";
import {
	usePreviousPictureNames,
	usePreviousVisualPictures,
	type PreviousPictures,
} from "./usePreviousVisualPictures";

/** Whether a video references the visual before it, and the pictures it would take, known before anything decodes. */
function useContinuity(element: CanvasContentElement) {
	const attrs = element.generationAttributes;
	const opensOnPrevious =
		parseStartFrame(attrs?.[START_FRAME_ATTR])?.kind === "previous";
	const { rest: names } = splitPrevious(
		usePreviousPictureNames(element),
		opensOnPrevious,
	);
	return { linked: isLinked(attrs?.[CONTINUITY_ATTR]), opensOnPrevious, names };
}

function caption(pictures: PreviousPictures, linked: boolean, count: number) {
	if (pictures.kind === "loading") return "Loading the previous scene…";
	if (pictures.kind === "empty") return pictures.reason;
	if (!linked) return "Unlinked from the previous scene";
	return count > 0
		? `+${count} from the previous scene`
		: "Previous scene not referenced";
}

/**
 * The pictures a video references from the visual before it, beneath the
 * toggle that links them. A frame it already opens on is its start frame, so
 * it is left out.
 */
function ContinuitySection({
	element,
	toggle,
}: {
	element: CanvasContentElement;
	toggle: ReactNode;
}) {
	const { linked, opensOnPrevious, names } = useContinuity(element);
	const pictures = usePreviousVisualPictures(element);
	const { rest: urls } = splitPrevious(
		pictures.kind === "ready" ? pictures.urls : [],
		opensOnPrevious,
	);

	return (
		<section className="mt-3 border-t border-border pt-3">
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="text-label text-muted-foreground">
					{caption(pictures, linked, names.length)}
				</p>
				{toggle}
			</div>
			{urls.length > 0 && (
				<div
					className={cn(
						"flex flex-wrap gap-2 transition-opacity",
						!linked && "opacity-40",
					)}
				>
					{urls.map((url, index) => (
						<AssetTile
							key={url}
							name={names[index]}
							previewUrl={url}
							Icon={Image}
						/>
					))}
				</div>
			)}
		</section>
	);
}

/** A video's reference images, counting the pictures continuity adds, with those pictures and the toggle that links them beneath. */
export function ContinuityReferencesPopover({
	toggle,
	...popover
}: ReferenceImagesPopoverProps & { toggle: ReactNode }) {
	const { linked, names } = useContinuity(popover.element);
	return (
		<ReferenceImagesPopover {...popover} added={linked ? names.length : 0}>
			<ContinuitySection element={popover.element} toggle={toggle} />
		</ReferenceImagesPopover>
	);
}
