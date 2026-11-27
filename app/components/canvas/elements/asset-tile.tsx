"use client";

import type { IconComponent } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
} from "@/components/ui/thumbnail";
import {
	isGenerationActive,
	type GenerationStatus,
} from "@/lib/generation/snapshots";
import type { VisualKind } from "@/lib/canvas/types";
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { GenerationIndicator } from "./generation-indicator";
import {
	TileMenu,
	TilePrimaryAction,
	TileRemoveActions,
	useViewLarger,
	type TilePrimary,
} from "./tile-actions";

/** A picture or initial over its name: choosing the face does `primary`, Remove and Delete sit top-left, the ⋮ holds the rest. */
export function AssetTile({
	name,
	previewUrl,
	previewKind = "image",
	context,
	createdAt,
	costUsd,
	Icon,
	status = "idle",
	startedAt = null,
	primary,
	menu,
	onRemove,
	removeFrom,
	onDelete,
	children,
	fallback = "initial",
}: {
	name: string;
	previewUrl?: string;
	previewKind?: VisualKind;
	/** What the picture is, as its larger view says. */
	context?: string;
	createdAt?: string;
	costUsd?: number;
	Icon: IconComponent;
	status?: GenerationStatus;
	startedAt?: number | null;
	primary?: TilePrimary;
	onRemove?: () => void;
	/** What Remove takes the tile off, when its label should say. */
	removeFrom?: string;
	onDelete?: () => void;
	/** Menu items after View larger. */
	menu?: React.ReactNode;
	/** Over the face, under its actions. */
	children?: React.ReactNode;
	fallback?: "initial" | "icon";
}) {
	const viewer = useViewLarger(
		previewUrl
			? {
					src: previewUrl,
					kind: previewKind,
					name,
					context,
					createdAt,
					costUsd,
				}
			: undefined,
	);
	const fallbackContent =
		fallback === "icon" ? (
			<Icon className="h-5 w-5" />
		) : (
			name.trim().charAt(0).toUpperCase()
		);
	return (
		<Thumbnail className="group/tile relative">
			<ThumbnailFace className="@container/tile">
				{previewUrl ? (
					<MediaWithSkeleton
						key={previewUrl}
						outputKind={previewKind}
						src={previewUrl}
						alt=""
					/>
				) : (
					<span className="flex items-center justify-center text-body-lg">
						{fallbackContent}
					</span>
				)}
				{status === "generating" && (
					<Skeleton className="absolute inset-0" aria-hidden />
				)}
				{children}
				{primary && <TilePrimaryAction {...primary} />}
				{isGenerationActive(status) ? (
					<GenerationIndicator
						status={status}
						startedAt={startedAt}
						size="sm"
						className="absolute top-1 right-1"
					/>
				) : (
					<>
						<TileRemoveActions
							name={name}
							onRemove={onRemove}
							removeFrom={removeFrom}
							onDelete={onDelete}
						/>
						<TileMenu label={name}>
							{viewer.item}
							{menu}
						</TileMenu>
					</>
				)}
			</ThumbnailFace>
			{viewer.dialog}
			<ThumbnailCaption title={name} icon={<Icon size={10} />}>
				{name}
			</ThumbnailCaption>
		</Thumbnail>
	);
}
