"use client";

import { Pencil, type IconComponent } from "@/components/ui/icon";
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
import { ImageWithShimmer } from "@/lib/components/image-with-shimmer";
import type { ContentType } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { GenerationIndicator } from "./generation-indicator";
import { ELEMENT_CONFIGS } from "./element-configs";
import { MediaViewer } from "./media-viewer";
import { RemoveCrossButton } from "./remove-cross-button";

export function AssetTile({
	name,
	previewUrl,
	Icon,
	type,
	status = "idle",
	startedAt = null,
	onEdit,
	onRemove,
	fallback = "initial",
	fill = false,
}: {
	name: string;
	previewUrl?: string;
	Icon: IconComponent;
	/** Badges the caption with this type's colors. */
	type?: ContentType;
	status?: GenerationStatus;
	startedAt?: number | null;
	onEdit?: () => void;
	onRemove?: () => void;
	fallback?: "initial" | "icon";
	fill?: boolean;
}) {
	const fallbackContent =
		fallback === "icon" ? (
			<Icon className="h-5 w-5" />
		) : (
			name.trim().charAt(0).toUpperCase()
		);
	return (
		<Thumbnail fill={fill} className="group/tile relative">
			<ThumbnailFace>
				{previewUrl ? (
					<ImageWithShimmer
						key={previewUrl}
						src={previewUrl}
						alt={name}
						fill
						unoptimized
						className="object-cover"
					/>
				) : (
					<span className="text-body-lg">{fallbackContent}</span>
				)}
				{status === "generating" && (
					<Skeleton className="absolute inset-0" aria-hidden />
				)}
				{isGenerationActive(status) && (
					<GenerationIndicator
						status={status}
						startedAt={startedAt}
						size="sm"
						className="absolute right-1 top-1"
					/>
				)}
				{onEdit && (
					<button
						type="button"
						onClick={onEdit}
						aria-label={`Edit ${name}`}
						className="focus-ring absolute inset-0 flex items-center justify-center bg-background/70 text-foreground opacity-0 transition group-hover/tile:opacity-100 hover:bg-background/90 focus-visible:opacity-100 focus-visible:ring-inset"
					>
						<Pencil className="h-3.5 w-3.5" />
					</button>
				)}
				{previewUrl && (
					<MediaViewer
						src={previewUrl}
						kind="image"
						name={name}
						className="opacity-0 group-hover/tile:opacity-100"
					/>
				)}
			</ThumbnailFace>
			{onRemove && status !== "generating" && (
				<RemoveCrossButton
					label={`Remove ${name}`}
					onClick={onRemove}
					className="z-10 opacity-0 group-hover/tile:opacity-100"
				/>
			)}
			<ThumbnailCaption
				title={name}
				icon={type && <TypeBadge type={type} Icon={Icon} />}
			>
				{name}
			</ThumbnailCaption>
		</Thumbnail>
	);
}

function TypeBadge({ type, Icon }: { type: ContentType; Icon: IconComponent }) {
	const { iconBgClass, colorClass } = ELEMENT_CONFIGS[type];
	return (
		<span
			className={cn(
				"flex h-4 shrink-0 items-center justify-center rounded-sm px-1",
				iconBgClass,
				colorClass,
			)}
		>
			<Icon size={10} />
		</span>
	);
}
