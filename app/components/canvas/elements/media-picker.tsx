"use client";

import { useState, type ReactNode } from "react";
import {
	FolderOpen,
	PanelLeft,
	PlusCircle,
	Upload,
} from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	ThumbnailGrid,
	THUMBNAIL_POPOVER_WIDTH,
} from "@/components/ui/thumbnail";
import { findMedia, type MediaItem } from "@/lib/project/media";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { useProject } from "@/lib/project/use-project";
import { createRequiredContext } from "@/lib/components/create-required-context";
import type { UploadKind } from "@/lib/upload/upload-files";
import { useEditorPanel } from "../panel/editor-panel-context";
import { LoadRequestItem, useLoadRequest } from "../playground/load-request";
import { MediaAssetTile } from "./asset-tiles";
import { EmptyLibrary, MediaSearch } from "./media-kinds";
import { uploadingTiles } from "./uploading-tile";

/** Choosing the tile uses the media for whatever asked; its request waits in the menu. */
function MediaChoice({
	item,
	onPick,
}: {
	item: MediaItem;
	onPick: () => void;
}) {
	const request = useLoadRequest(item);
	return (
		<MediaAssetTile
			item={item}
			primary={{ label: "Use this", icon: PlusCircle, onSelect: onPick }}
			menu={request && <LoadRequestItem {...request} />}
		/>
	);
}

type MediaUpload = ReturnType<typeof useMediaUpload>;

/** Mounted only while the popover is open, so a closed picker reads no media. */
function MediaChoices({
	kind,
	upload,
	onPick,
}: {
	kind: UploadKind;
	upload: MediaUpload;
	onPick: (url: string) => void;
}) {
	const [query, setQuery] = useState("");
	const media = useProject((state) => state.media);
	const items = findMedia(media, kind, query);
	return (
		<>
			<div className="flex items-center gap-1">
				<div className="min-w-0 flex-1">
					<MediaSearch kind={kind} query={query} onQueryChange={setQuery} />
				</div>
				<TooltipIconButton
					label={`Upload ${kind}`}
					variant="inherit"
					disabled={upload.uploading}
					onClick={upload.openPicker}
				>
					<Upload />
				</TooltipIconButton>
			</div>
			<div
				className="-mx-1 mt-2 max-h-80 overflow-y-auto overscroll-contain px-1"
				{...upload.dropZoneProps}
			>
				{items.length === 0 && !upload.uploading ? (
					<EmptyLibrary kind={kind} query={query} />
				) : (
					<ThumbnailGrid columns={2}>
						{uploadingTiles(upload.uploadingCount, kind)}
						{items.map((item) => (
							<MediaChoice
								key={item.name}
								item={item}
								onPick={() => onPick(item.url)}
							/>
						))}
					</ThumbnailGrid>
				)}
			</div>
		</>
	);
}

const [UploadingContext, useMediaPickerUploading] =
	createRequiredContext<boolean>("MediaPicker");
/** Whether the picker's upload is still landing, for a trigger that shows it. */
export { useMediaPickerUploading };

/** Supplies media from the project's own, the computer or the playground, picked in a popover its `children` open. */
export function MediaPicker({
	kind,
	onPick,
	children,
}: {
	kind: UploadKind;
	onPick: (url: string) => void | Promise<void>;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const { setActive } = useEditorPanel();
	const pick = (url: string) => {
		setOpen(false);
		void onPick(url);
	};
	// Outlives the popover, so an upload still running when it closes lands.
	const upload = useMediaUpload({
		kinds: [kind],
		onUpload: ([url]) => {
			if (url) pick(url);
		},
	});
	return (
		<Popover open={open} onOpenChange={setOpen}>
			{upload.inputElement}
			<UploadingContext value={upload.uploading}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
			</UploadingContext>
			<PopoverContent align="end" className={THUMBNAIL_POPOVER_WIDTH}>
				<PopoverHeader
					title="Media library"
					icon={FolderOpen}
					action={
						<TooltipIconButton
							label="Open playground"
							variant="inherit"
							onClick={() => {
								setOpen(false);
								setActive("playground");
							}}
						>
							<PanelLeft />
						</TooltipIconButton>
					}
				/>
				<MediaChoices kind={kind} upload={upload} onPick={pick} />
			</PopoverContent>
		</Popover>
	);
}
