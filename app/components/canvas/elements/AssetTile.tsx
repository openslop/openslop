"use client";

import { Pencil, X, type LucideIcon } from "lucide-react";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import { GenerationIndicator } from "./GenerationIndicator";

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
		fallback === "icon" || !initial ? <Icon className="h-4 w-4" /> : initial;
	return (
		<div className="group/tile flex w-16 flex-col gap-1 sm:w-20">
			<div className="relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/5">
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
					<div className="flex size-full items-center justify-center text-base text-white/60">
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
					<div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/40 text-white/80">
						<Icon className="h-2.5 w-2.5" />
					</div>
				)}
				{onEdit && status !== "generating" && (
					<button
						type="button"
						onClick={onEdit}
						aria-label={`Edit ${name ?? "asset"}`}
						className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover/tile:opacity-100 focus:opacity-100 focus:outline-none"
					>
						<Pencil className="h-3.5 w-3.5" />
					</button>
				)}
				{onRemove && status !== "generating" && (
					<button
						type="button"
						onClick={onRemove}
						aria-label={`Remove ${name ?? "asset"}`}
						className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover/tile:opacity-100 focus:opacity-100 focus:outline-none"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
			</div>
			{name && (
				<span className="truncate text-[10px] text-white/70" title={name}>
					{name}
				</span>
			)}
		</div>
	);
}
