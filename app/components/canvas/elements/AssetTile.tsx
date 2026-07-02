"use client";

import { Pencil, X, type LucideIcon } from "@/components/ui/icon";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import { GenerationIndicator } from "./GenerationIndicator";

function OverlayButton({
	icon: Icon,
	label,
	onClick,
}: {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className="absolute inset-0 flex items-center justify-center bg-background/70 text-foreground opacity-0 transition-opacity group-hover/tile:opacity-100 focus:opacity-100 focus:outline-none"
		>
			<Icon className="h-3.5 w-3.5" />
		</button>
	);
}

export function AssetTile({
	name,
	previewUrl,
	Icon,
	elementId,
	onEdit,
	onRemove,
	fallback = "initial",
}: {
	name?: string;
	previewUrl?: string;
	Icon: LucideIcon;
	elementId?: string;
	onEdit?: () => void;
	onRemove?: () => void;
	fallback?: "initial" | "icon";
}) {
	const status = useQueueSelector(
		(q) => q.getElementSnapshot(elementId).status,
	);
	const initial = name?.trim().charAt(0).toUpperCase();
	const fallbackContent =
		fallback === "icon" || !initial ? <Icon className="h-5 w-5" /> : initial;
	return (
		<div className="group/tile flex w-16 flex-col gap-1 sm:w-20">
			<div className="relative aspect-square overflow-hidden rounded-md border border-border bg-card">
				{previewUrl ? (
					<ImageWithShimmer
						key={previewUrl}
						src={previewUrl}
						alt={name ?? ""}
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
					<div
						className="shimmer-surface absolute inset-0 rounded-md"
						aria-hidden
					/>
				)}
				{status !== "idle" && (
					<GenerationIndicator
						status={status}
						size="sm"
						className="absolute right-1 top-1"
					/>
				)}
				{status === "idle" && previewUrl && (
					<div className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-md bg-card text-foreground shadow-sm ring-1 ring-border">
						<Icon className="h-3 w-3" />
					</div>
				)}
				{onEdit && status !== "generating" && (
					<OverlayButton
						icon={Pencil}
						label={`Edit ${name ?? "asset"}`}
						onClick={onEdit}
					/>
				)}
				{onRemove && status !== "generating" && (
					<OverlayButton
						icon={X}
						label={`Remove ${name ?? "asset"}`}
						onClick={onRemove}
					/>
				)}
			</div>
			{name && (
				<span
					className="truncate text-badge text-muted-foreground"
					title={name}
				>
					{name}
				</span>
			)}
		</div>
	);
}
