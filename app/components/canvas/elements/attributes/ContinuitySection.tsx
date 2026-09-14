"use client";

import { Image } from "@/components/ui/icon";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	CONTINUITY_ATTR,
	hasContinuity,
	parseStartFrame,
	splitPrevious,
	START_FRAME_ATTR,
} from "@/lib/connectors/video/startFrame";
import { cn } from "@/lib/utils";
import { AssetTile } from "../AssetTile";
import {
	usePreviousVisualPictures,
	type PreviousPictures,
} from "./usePreviousVisualPictures";

const FRAME_NAMES = ["First frame", "Middle frame", "Last frame"];

const named = (urls: string[]) =>
	urls.map((url, index) => ({
		url,
		name: urls.length === FRAME_NAMES.length ? FRAME_NAMES[index] : "Picture",
	}));

function caption(pictures: PreviousPictures, on: boolean, count: number) {
	if (pictures.kind === "loading") return "Loading the previous scene…";
	if (pictures.kind === "empty") return pictures.reason;
	return on
		? `+${count} from the previous scene`
		: "Previous scene not referenced";
}

/**
 * The pictures a video references from the visual before it, beneath the
 * toggle that switches them. A frame it already opens on is its start frame,
 * so it is left out.
 */
export function ContinuitySection({
	element,
	children,
}: {
	element: CanvasContentElement;
	children: React.ReactNode;
}) {
	const attrs = element.generationAttributes;
	const on = hasContinuity(attrs?.[CONTINUITY_ATTR]);
	const pictures = usePreviousVisualPictures(element);
	const { rest } = splitPrevious(
		pictures.kind === "ready" ? named(pictures.urls) : [],
		parseStartFrame(attrs?.[START_FRAME_ATTR])?.kind === "previous",
	);

	return (
		<section className="mt-3 border-t border-border pt-3">
			<div className="mb-2 flex items-center justify-between gap-2">
				<span className="text-label text-muted-foreground">
					{caption(pictures, on, rest.length)}
				</span>
				{children}
			</div>
			{rest.length > 0 && (
				<div
					className={cn(
						"flex flex-wrap gap-2 transition-opacity",
						!on && "opacity-40",
					)}
				>
					{rest.map(({ url, name }) => (
						<AssetTile key={url} name={name} previewUrl={url} Icon={Image} />
					))}
				</div>
			)}
		</section>
	);
}
