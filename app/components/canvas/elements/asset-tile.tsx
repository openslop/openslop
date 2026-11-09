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
import { MediaWithSkeleton } from "@/lib/components/media-with-skeleton";
import { GenerationIndicator } from "./generation-indicator";
import {
	DeleteAction,
	EditAction,
	RemoveAction,
	TileActions,
	ViewLargerAction,
} from "./tile-actions";

export function AssetTile({
	name,
	previewUrl,
	previewKind = "image",
	context,
	createdAt,
	Icon,
	status = "idle",
	startedAt = null,
	onEdit,
	onRemove,
	onDelete,
	actions,
	children,
	fallback = "initial",
}: {
	name: string;
	previewUrl?: string;
	previewKind?: "image" | "video";
	/** What the picture is, as its larger view says. */
	context?: string;
	createdAt?: string;
	Icon: IconComponent;
	status?: GenerationStatus;
	startedAt?: number | null;
	onEdit?: () => void;
	onRemove?: () => void;
	onDelete?: () => void;
	/** Between edit and remove or delete in the pill. */
	actions?: React.ReactNode;
	/** Over the face, under the pill. */
	children?: React.ReactNode;
	fallback?: "initial" | "icon";
}) {
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
				{isGenerationActive(status) && (
					<GenerationIndicator
						status={status}
						startedAt={startedAt}
						size="sm"
						className="absolute top-1 right-1"
					/>
				)}
				{children}
				<TileActions label={name}>
					{previewUrl && (
						<ViewLargerAction
							src={previewUrl}
							kind={previewKind}
							name={name}
							context={context}
							createdAt={createdAt}
						/>
					)}
					{onEdit && <EditAction name={name} onClick={onEdit} />}
					{actions}
					{onRemove && status !== "generating" && (
						<RemoveAction name={name} onClick={onRemove} />
					)}
					{onDelete && status !== "generating" && (
						<DeleteAction name={name} onClick={onDelete} />
					)}
				</TileActions>
			</ThumbnailFace>
			<ThumbnailCaption title={name} icon={<Icon size={10} />}>
				{name}
			</ThumbnailCaption>
		</Thumbnail>
	);
}
