"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	FolderOpen,
	ImagePlus,
	Upload,
	Video,
	type IconComponent,
} from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
	ThumbnailGrid,
} from "@/components/ui/thumbnail";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { findMedia, type MediaItem } from "@/lib/project/media";
import { useMediaUpload } from "@/lib/project/use-media-upload";
import { useProject } from "@/lib/project/use-project";
import type { UploadKind } from "@/lib/upload/upload-files";
import { AddAssetTile } from "./add-asset-tile";
import { EmptyLibrary, MEDIA_KINDS, MediaSearch } from "./media-kinds";
import { TileActions, ViewLargerAction } from "./tile-actions";

const ADD: Record<UploadKind, { label: string; Icon: IconComponent }> = {
	image: { label: "Add image", Icon: ImagePlus },
	video: { label: "Add video", Icon: Video },
	audio: { label: "Add audio", Icon: MEDIA_KINDS.audio.Icon },
};

function MediaChoice({
	item: { name, kind, url },
	onPick,
}: {
	item: MediaItem;
	onPick: () => void;
}) {
	const pictured = kind === "audio" ? undefined : kind;
	const { Icon } = MEDIA_KINDS[kind];
	return (
		<div className="group/tile @container/tile relative">
			<Thumbnail asChild>
				<button
					type="button"
					onClick={onPick}
					aria-label={`Use ${name}`}
					className="focus-ring rounded-md"
				>
					<ThumbnailFace>
						{pictured ? (
							<MediaWithSkeleton outputKind={pictured} src={url} alt="" />
						) : (
							<Icon className="h-5 w-5" />
						)}
					</ThumbnailFace>
					<ThumbnailCaption title={name} icon={<Icon size={10} />}>
						{name}
					</ThumbnailCaption>
				</button>
			</Thumbnail>
			{pictured && (
				<TileActions label={name}>
					<ViewLargerAction src={url} kind={pictured} name={name} />
				</TileActions>
			)}
		</div>
	);
}

/** The first tile: a file from the computer, dropped or picked, joins the media and is used. */
function UploadChoice({
	kind,
	onPick,
}: {
	kind: UploadKind;
	onPick: (url: string) => void;
}) {
	const { openPicker, uploading, inputElement, dropZoneProps } = useMediaUpload(
		{
			kinds: [kind],
			onUpload: ([url]) => {
				if (url) onPick(url);
			},
		},
	);
	return (
		<>
			<AddAssetTile
				label={`Upload ${kind}`}
				ariaLabel={`Upload ${kind} from your computer`}
				Icon={Upload}
				onClick={openPicker}
				disabled={uploading}
				busy={uploading}
				{...dropZoneProps}
			/>
			{inputElement}
		</>
	);
}

/** Mounted only while the popover is open, so a closed picker reads no media. */
function MediaChoices({
	kind,
	onPick,
}: {
	kind: UploadKind;
	onPick: (url: string) => void;
}) {
	const [query, setQuery] = useState("");
	const media = useProject((state) => state.media);
	const items = findMedia(media, kind, query);
	return (
		<>
			<MediaSearch kind={kind} query={query} onQueryChange={setQuery} />
			<div className="-mx-1 mt-2 max-h-80 overflow-y-auto overscroll-contain px-1">
				{query.trim() && items.length === 0 ? (
					<EmptyLibrary kind={kind} query={query} />
				) : (
					<ThumbnailGrid columns={2}>
						<UploadChoice kind={kind} onPick={onPick} />
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

/** Supplies media from the project's own or from the computer, picked in a popover. */
export function MediaPicker({
	kind,
	onPick,
	disabled,
	className,
}: {
	kind: UploadKind;
	onPick: (url: string) => void | Promise<void>;
	disabled?: boolean;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const { label, Icon } = ADD[kind];
	const pick = (url: string) => {
		setOpen(false);
		void onPick(url);
	};
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					tooltip={label}
					disabled={disabled}
					onMouseDown={keepFocus}
					className={className}
				>
					<Icon aria-hidden="true" />
					<span className="hidden sm:inline">{label}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80">
				<PopoverHeader title="Media Library" icon={FolderOpen} />
				<MediaChoices kind={kind} onPick={pick} />
			</PopoverContent>
		</Popover>
	);
}
