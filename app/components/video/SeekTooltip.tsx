"use client";

import { clamp } from "@/lib/utils";
import { formatTime } from "@/lib/video/timestamps";

export type SeekThumbnail = { url: string; kind: "image" | "video" };

const TOOLTIP_WIDTH = 160;

export function SeekTooltip({
	x,
	containerWidth,
	timeSec,
	label,
	thumbnail,
}: {
	x: number;
	containerWidth: number;
	timeSec: number;
	label: string;
	thumbnail: SeekThumbnail | null;
}) {
	const half = TOOLTIP_WIDTH / 2;
	const left = clamp(x, half, Math.max(half, containerWidth - half));

	return (
		<div
			className="pointer-events-none absolute bottom-full z-50 mb-2 -translate-x-1/2"
			style={{ left, width: TOOLTIP_WIDTH }}
		>
			<div className="aspect-video w-full overflow-hidden rounded-md bg-on-media/80 ring-1 ring-border">
				{thumbnail ? (
					thumbnail.kind === "image" ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={thumbnail.url}
							alt=""
							className="h-full w-full object-contain"
						/>
					) : (
						<video
							src={thumbnail.url}
							preload="metadata"
							muted
							playsInline
							className="h-full w-full object-contain"
						/>
					)
				) : null}
			</div>
			<div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-on-media/80 px-2 py-1 text-label text-on-media-foreground shadow-sm">
				<span className="tabular-nums">{formatTime(timeSec)}</span>
				<span className="truncate text-on-media-foreground/70">{label}</span>
			</div>
		</div>
	);
}
