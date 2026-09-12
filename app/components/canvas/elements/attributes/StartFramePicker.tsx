"use client";

import { useSlate } from "slate-react";
import { ArrowLeft, ImagePlus } from "@/components/ui/icon";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import { getContentElements, previousVisual } from "@/lib/canvas/scenes";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { MediaWithSkeleton } from "@/lib/components/MediaWithSkeleton";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import {
	parseStartFrame,
	PREVIOUS_SCENE,
} from "@/lib/connectors/video/startFrame";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { cn } from "@/lib/utils";
import { AddAssetTile } from "../AddAssetTile";
import { RemoveCrossButton } from "../RemoveCrossButton";
import { AttributeTrigger } from "./AttributeTrigger";

/** A square choice: the picture it stands for, or an icon while there is none. */
function FrameTile({
	label,
	selected,
	onSelect,
	children,
}: {
	label: string;
	selected: boolean;
	onSelect: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			role="radio"
			aria-checked={selected}
			aria-label={label}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onSelect}
			className="focus-ring flex w-16 flex-col gap-1 sm:w-20"
		>
			<div
				className={cn(
					"relative flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-card text-muted-foreground",
					selected ? "border-accent ring-2 ring-accent" : "border-border",
				)}
			>
				{children}
			</div>
			<span className="truncate text-badge text-muted-foreground">{label}</span>
		</button>
	);
}

/** What the visual before this clip has made, if anything yet. */
function PreviousScenePreview({ element }: { element: CanvasContentElement }) {
	const editor = useSlate();
	const source = previousVisual(
		getContentElements(editor.children),
		element.id,
	);
	const url = useQueueSelector((q) =>
		source
			? getPrimaryUrl(
					q.getElementSnapshot(source.id).result,
					ELEMENT_TYPES[source.type].outputKind,
				)
			: undefined,
	);
	if (!source || !url) return <ArrowLeft className="h-5 w-5" />;
	return (
		<MediaWithSkeleton
			outputKind={ELEMENT_TYPES[source.type].outputKind}
			src={url}
			alt=""
		/>
	);
}

/**
 * The picture a clip opens on: the end of the visual before it, or one of the
 * user's own. Each choice shows the picture it stands for.
 */
export function StartFramePicker({
	element,
	attrKey,
	label,
	hideLabel = false,
}: {
	element: CanvasContentElement;
	attrKey: string;
	label: string;
	hideLabel?: boolean;
}) {
	const editor = useSlate();
	const frame = parseStartFrame(element.generationAttributes?.[attrKey]);
	const own = frame?.kind === "url" ? frame.url : undefined;
	const setFrame = (next: string) =>
		updateElementAttrs(editor, element, { [attrKey]: next });
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => url && setFrame(url),
	});
	const summary = own ? "Your picture" : "Previous scene";

	return (
		<Popover>
			<AttributeTrigger tooltip={`${label}: ${summary}`}>
				{!hideLabel && <span className="opacity-70 mr-1">{label}</span>}
				{summary}
			</AttributeTrigger>
			<PopoverContent align="start" className="w-auto">
				<div role="radiogroup" aria-label={label} className="flex gap-3">
					<FrameTile
						label="Previous scene"
						selected={!own}
						onSelect={() => setFrame(PREVIOUS_SCENE)}
					>
						<PreviousScenePreview element={element} />
					</FrameTile>
					{own ? (
						<div className="group/tile relative">
							<FrameTile label="Your picture" selected onSelect={() => {}}>
								<MediaWithSkeleton outputKind="image" src={own} alt="" />
							</FrameTile>
							<RemoveCrossButton
								label="Remove your picture"
								onClick={() => setFrame(PREVIOUS_SCENE)}
								className="opacity-0 group-hover/tile:opacity-100"
							/>
						</div>
					) : (
						<AddAssetTile
							label="Your picture"
							ariaLabel="Upload your own start frame"
							Icon={ImagePlus}
							onClick={openPicker}
							disabled={uploading}
							busy={uploading}
						/>
					)}
				</div>
				{inputElement}
			</PopoverContent>
		</Popover>
	);
}
