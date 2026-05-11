"use client";

import { type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { GenerationIndicator } from "./GenerationIndicator";

export function AssetTile({
	name,
	previewUrl,
	Icon,
	elementId,
}: {
	name?: string;
	previewUrl?: string;
	Icon: LucideIcon;
	elementId?: string;
}) {
	const status = useQueueSelector(
		(q) => q.getElementSnapshot(elementId).status,
	);
	const initial = name?.trim().charAt(0).toUpperCase();
	return (
		<div className="flex w-16 flex-col gap-1 sm:w-20">
			<div className="relative aspect-square overflow-hidden rounded-md border border-white/10">
				<Avatar className="size-full rounded-md bg-white/5">
					{previewUrl && (
						<AvatarImage
							src={previewUrl}
							alt={name ?? ""}
							className="object-cover"
						/>
					)}
					<AvatarFallback className="rounded-md bg-white/5 text-base text-white/60">
						{initial || <Icon className="h-4 w-4" />}
					</AvatarFallback>
				</Avatar>
				{status === "generating" && (
					<div
						className="shimmer-surface absolute inset-0 rounded-md"
						aria-hidden
					/>
				)}
				{status === "idle" ? (
					<div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/40 text-white/80">
						<Icon className="h-2.5 w-2.5" />
					</div>
				) : (
					<GenerationIndicator
						status={status}
						size="sm"
						className="absolute right-1 top-1"
					/>
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
