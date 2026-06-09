"use client";

import { formatTime } from "@/lib/video/timestamps";

export type SeekThumbnail = { url: string; kind: "image" | "video" };

const TOOLTIP_WIDTH = 160;

const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n));

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
			className="pointer-events-none absolute bottom-full mb-2 -translate-x-1/2"
			style={{ left, width: TOOLTIP_WIDTH }}
		>
			<div className="aspect-video w-full overflow-hidden rounded-md bg-black/80 ring-1 ring-white/10">
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
			<div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-sm">
				<span className="tabular-nums">{formatTime(timeSec)}</span>
				<span className="text-white/80">{label}</span>
			</div>
		</div>
	);
}
