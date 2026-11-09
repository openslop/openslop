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
import { Spinner } from "@/components/ui/spinner";
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
	item: { name, kind, url, createdAt },
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
					<ViewLargerAction
						src={url}
						kind={pictured}
						name={name}
						context="Media library"
						createdAt={createdAt}
					/>
				</TileActions>
			)}
		</div>
	);
}

type MediaUpload = ReturnType<typeof useMediaUpload>;

/** The first tile: a file from the computer, dropped or picked, joins the media and is used. */
function UploadChoice({
	kind,
	upload: { openPicker, uploading, dropZoneProps },
}: {
	kind: UploadKind;
	upload: MediaUpload;
}) {
	return (
		<AddAssetTile
			label={`Upload ${kind}`}
			ariaLabel={`Upload ${kind} from your computer`}
			Icon={Upload}
			onClick={openPicker}
			disabled={uploading}
			busy={uploading}
			{...dropZoneProps}
		/>
	);
}

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
			<MediaSearch kind={kind} query={query} onQueryChange={setQuery} />
			<div className="-mx-1 mt-2 max-h-80 overflow-y-auto overscroll-contain px-1">
				{query.trim() && items.length === 0 ? (
					<EmptyLibrary kind={kind} query={query} />
				) : (
					<ThumbnailGrid columns={2}>
						<UploadChoice kind={kind} upload={upload} />
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
	// Outlives the popover, so an upload still running when it closes lands.
	const upload = useMediaUpload({
		kinds: [kind],
		onUpload: ([url]) => {
			if (url) pick(url);
		},
	});
	const shown = upload.uploading ? `Uploading ${kind}…` : label;
	return (
		<Popover open={open} onOpenChange={setOpen}>
			{upload.inputElement}
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					tooltip={shown}
					disabled={disabled || upload.uploading}
					onMouseDown={keepFocus}
					className={className}
				>
					{upload.uploading ? <Spinner /> : <Icon aria-hidden="true" />}
					<span className="hidden sm:inline">{shown}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80">
				<PopoverHeader title="Media library" icon={FolderOpen} />
				<MediaChoices kind={kind} upload={upload} onPick={pick} />
			</PopoverContent>
		</Popover>
	);
}
