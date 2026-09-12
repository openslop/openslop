"use client";

import { useSlate } from "slate-react";
import { Forbidden, ImagePlus, Transition } from "@/components/ui/icon";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import { getContentElements, previousVisual } from "@/lib/canvas/scenes";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { MediaWithSkeleton } from "@/lib/components/MediaWithSkeleton";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import {
	NO_FRAME,
	parseStartFrame,
	PREVIOUS_VISUAL,
	UPLOADED_FRAME_ATTR,
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

/** What the visual before this video has made, if anything yet. */
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
	if (!source || !url) return <Transition className="h-5 w-5" />;
	return (
		<MediaWithSkeleton
			outputKind={ELEMENT_TYPES[source.type].outputKind}
			src={url}
			alt=""
		/>
	);
}

/**
 * The picture a video opens on: none, the end of the visual before it, or one
 * the user uploaded. Each choice shows the picture it stands for, and an
 * upload is kept while another choice is made so it can be chosen again.
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
	const uploaded = element.layoutAttributes?.[UPLOADED_FRAME_ATTR];
	const usesUpload = frame?.kind === "url";
	const usesPrevious = frame?.kind === "previous";
	const setFrame = (next: string, upload = uploaded ?? null) =>
		updateElementAttrs(editor, element, {
			[attrKey]: next,
			[UPLOADED_FRAME_ATTR]: upload,
		});
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => url && setFrame(url, url),
	});
	const summary = usesUpload
		? "Uploaded picture"
		: usesPrevious
			? "Previous scene"
			: "None";

	return (
		<Popover>
			<AttributeTrigger tooltip={`${label}: ${summary}`}>
				{!hideLabel && <span className="opacity-70 mr-1">{label}</span>}
				{summary}
			</AttributeTrigger>
			<PopoverContent align="end" className="w-auto">
				<div role="radiogroup" aria-label={label} className="flex gap-3">
					<FrameTile
						label="None"
						selected={!usesUpload && !usesPrevious}
						onSelect={() => setFrame(NO_FRAME)}
					>
						<Forbidden className="h-5 w-5" />
					</FrameTile>
					<FrameTile
						label="Previous scene"
						selected={usesPrevious}
						onSelect={() => setFrame(PREVIOUS_VISUAL)}
					>
						<PreviousScenePreview element={element} />
					</FrameTile>
					{uploaded ? (
						<div className="group/tile relative">
							<FrameTile
								label="Uploaded picture"
								selected={usesUpload}
								onSelect={() => setFrame(uploaded)}
							>
								<MediaWithSkeleton outputKind="image" src={uploaded} alt="" />
							</FrameTile>
							<RemoveCrossButton
								label="Remove uploaded picture"
								onClick={() => setFrame(PREVIOUS_VISUAL, null)}
								className="opacity-0 group-hover/tile:opacity-100"
							/>
						</div>
					) : (
						<AddAssetTile
							label="Upload picture"
							ariaLabel="Upload a picture to open on"
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
