"use client";

import { Pencil, type IconComponent } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
	isGenerationActive,
	type GenerationStatus,
} from "@/lib/generation/snapshots";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import { cn } from "@/lib/utils";
import { GenerationIndicator } from "./GenerationIndicator";
import { RemoveCrossButton } from "./RemoveCrossButton";

function OverlayButton({
	icon: Icon,
	label,
	onClick,
}: {
	icon: IconComponent;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className="focus-ring absolute inset-0 flex items-center justify-center bg-background/70 text-foreground opacity-0 transition group-hover/tile:opacity-100 hover:bg-background/90 focus-visible:opacity-100 focus-visible:ring-inset"
		>
			<Icon className="h-3.5 w-3.5" />
		</button>
	);
}

export function AssetTile({
	name,
	previewUrl,
	Icon,
	status = "idle",
	onEdit,
	onRemove,
	fallback = "initial",
	fill = false,
}: {
	name: string;
	previewUrl?: string;
	Icon: IconComponent;
	status?: GenerationStatus;
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
		<div
			className={cn(
				"group/tile relative flex flex-col gap-1",
				!fill && "w-16 sm:w-20",
			)}
		>
			<div className="relative aspect-square overflow-hidden rounded-md border border-border bg-card">
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
					<div className="flex size-full items-center justify-center text-body-lg text-muted-foreground">
						{fallbackContent}
					</div>
				)}
				{status === "generating" && (
					<Skeleton className="absolute inset-0" aria-hidden />
				)}
				{isGenerationActive(status) && (
					<GenerationIndicator
						status={status}
						size="sm"
						className="absolute right-1 top-1"
					/>
				)}
				{!isGenerationActive(status) && previewUrl && (
					<div className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-card text-foreground shadow-sm ring-1 ring-border">
						<Icon className="h-3 w-3" />
					</div>
				)}
				{onEdit && (
					<OverlayButton
						icon={Pencil}
						label={`Edit ${name}`}
						onClick={onEdit}
					/>
				)}
			</div>
			{onRemove && status !== "generating" && (
				<RemoveCrossButton
					label={`Remove ${name}`}
					onClick={onRemove}
					className="z-10 opacity-0 group-hover/tile:opacity-100"
				/>
			)}
			<span className="truncate text-badge text-muted-foreground" title={name}>
				{name}
			</span>
		</div>
	);
}
