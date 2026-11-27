"use client";

import type { ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { Image, Mic, Palette, Pencil, Trash2 } from "@/components/ui/icon";
import { ASSET_KIND_SPECS } from "@/lib/canvas/assets";
import type { MediaItem } from "@/lib/project/media";
import { useImageAsset } from "../hooks/use-image-asset";
import { ASSET_KIND_ICONS } from "./asset-kinds";
import { AssetTile } from "./asset-tile";
import { AudioCard } from "./audio-card";
import { AudioPlayer } from "./audio-player";
import { MEDIA_KINDS } from "./media-kinds";
import { TileMenuItem, useTilePlayer, type TilePrimary } from "./tile-actions";
import { useAssetEditors } from "./asset-edit-context";
import { deleteArtStyle } from "./delete-asset";
import { LoadRequestItem, useLoadRequest } from "../media/load-request";

type TileProps = { children?: ReactNode };

const editing = (name: string, onSelect: () => void): TilePrimary => ({
	label: `Edit ${name}`,
	icon: Pencil,
	onSelect,
});

export function ArtStyleAssetTile(tile: TileProps) {
	const editor = useSlateStatic();
	const { editAsset } = useAssetEditors();
	return (
		<AssetTile
			name="Art style"
			Icon={Palette}
			fallback="icon"
			primary={editing("Art style", () => editAsset("asset_style"))}
			onDelete={() => deleteArtStyle(editor)}
			{...tile}
		/>
	);
}

type NamedTileProps = TileProps & { name: string; onDelete: () => void };

/** A named asset by its image, or a character by their voice when they have no avatar. */
export function NamedAssetTile({ name, ...tile }: NamedTileProps) {
	const { editAsset } = useAssetEditors();
	const { type, kind, url, status, startedAt } = useImageAsset(name);
	return type && kind ? (
		<AssetTile
			name={name}
			previewUrl={url}
			context={ASSET_KIND_SPECS[kind].label}
			Icon={ASSET_KIND_ICONS[kind]}
			status={status}
			startedAt={startedAt}
			primary={editing(name, () => editAsset(type, name))}
			{...tile}
		/>
	) : (
		<AssetTile
			name={name}
			Icon={Mic}
			fallback="icon"
			primary={editing(name, () => editAsset("asset_voice", name))}
			{...tile}
		/>
	);
}

type ReferenceTileProps = { url: string; index: number; onRemove: () => void };

const referenceName = (index: number) => `Reference ${index + 1}`;

/** A reference image: its corner button takes it off the references. */
export function ReferenceTile({
	url,
	index,
	primary,
	onRemove,
}: ReferenceTileProps & { primary?: TilePrimary }) {
	return (
		<AssetTile
			name={referenceName(index)}
			previewUrl={url}
			context="Reference image"
			Icon={Image}
			primary={primary}
			onRemove={onRemove}
			removeFrom="references"
		/>
	);
}

/** A project reference image on the canvas strip or the assets panel, where choosing it edits the references. */
export function ReferenceAssetTile(tile: ReferenceTileProps) {
	const { editAsset } = useAssetEditors();
	return (
		<ReferenceTile
			{...tile}
			primary={editing(referenceName(tile.index), () =>
				editAsset("asset_references"),
			)}
		/>
	);
}

type MediaTileProps = TileProps & {
	item: MediaItem;
	menu?: ReactNode;
	onDelete?: () => void;
};

/** A piece of the project's media as a small tile; the caller says what its face does, if anything. */
export function MediaAssetTile({
	item: { name, kind, url, createdAt, costUsd },
	primary,
	menu,
	onDelete,
	children,
}: MediaTileProps & { primary: TilePrimary | undefined }) {
	const previewKind = kind === "audio" ? undefined : kind;
	return (
		<AssetTile
			name={name}
			previewUrl={previewKind && url}
			previewKind={previewKind}
			context="Media"
			createdAt={createdAt}
			costUsd={costUsd}
			Icon={MEDIA_KINDS[kind].Icon}
			fallback="icon"
			primary={primary}
			menu={menu}
			onDelete={onDelete}
		>
			{children}
		</AssetTile>
	);
}

/** Media as a library shows it: a video's face plays it, anything else's loads its request, which is otherwise in the menu. */
export function LibraryMediaTile({
	item,
	menu,
	onDelete,
	children,
}: MediaTileProps) {
	const player = useTilePlayer(
		item.kind === "video" ? item.url : undefined,
		item.name,
	);
	const request = useLoadRequest(item);
	return (
		<MediaAssetTile
			item={item}
			primary={player.primary ?? request}
			menu={
				<>
					{player.primary && request && <LoadRequestItem {...request} />}
					{menu}
				</>
			}
			onDelete={onDelete}
		>
			{player.video}
			{children}
		</MediaAssetTile>
	);
}

/** Audio has no face to choose, so its request is always in the menu; a row keeps Delete there too. */
function MediaAudioRow({ item, menu, onDelete }: MediaTileProps) {
	const request = useLoadRequest(item);
	return (
		<AudioCard
			name={item.name}
			menu={
				<>
					{request && <LoadRequestItem {...request} />}
					{menu}
					{onDelete && (
						<TileMenuItem
							icon={Trash2}
							variant="destructive"
							onSelect={onDelete}
						>
							Delete
						</TileMenuItem>
					)}
				</>
			}
		>
			<AudioPlayer src={item.url} tone="panel" />
		</AudioCard>
	);
}

/** A piece of media as a library lists it: pictures and video as tiles, audio a row wide. */
export function MediaLibraryItem({
	item,
	menu,
	onDelete,
	children,
}: MediaTileProps) {
	return item.kind === "audio" ? (
		<MediaAudioRow item={item} menu={menu} onDelete={onDelete} />
	) : (
		<LibraryMediaTile item={item} menu={menu} onDelete={onDelete}>
			{children}
		</LibraryMediaTile>
	);
}
