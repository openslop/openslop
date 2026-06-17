"use client";

import { type PointerEvent, type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n));

/** A slice of a segmented track; `basis` is its fraction (0–1) of the whole. */
export interface ScrubSegment {
	id: string;
	basis: number;
}

export interface ScrubHover {
	/** Pointer x within the track, in px. */
	x: number;
	/** Track width, in px. */
	width: number;
	/** Pointer position as a 0–1 ratio. */
	ratio: number;
}

interface ScrubBarProps {
	/** Filled portion, 0–1. */
	value: number;
	ariaLabel: string;
	/** Fired with the 0–1 ratio on press and during drag. */
	onScrub: (ratio: number) => void;
	onScrubStart?: () => void;
	onScrubEnd?: () => void;
	/** Reports hover position (or null on leave) — e.g. to drive a tooltip. */
	onHoverChange?: (hover: ScrubHover | null) => void;
	/** Segmented layout; omit for a single continuous track. */
	segments?: ScrubSegment[];
	/** Sizing for the interactive container (width, optional height override). */
	className?: string;
	children?: ReactNode;
}

const SINGLE: ScrubSegment[] = [{ id: "_", basis: 1 }];

/**
 * Shared draggable track used by both the seek bar (segmented) and the volume
 * bar (continuous). Renders a rest track, a hover preview fill, a progress
 * fill, and a thumb — all driven by the `--scrub-*` tokens.
 */
export function ScrubBar({
	value,
	ariaLabel,
	onScrub,
	onScrubStart,
	onScrubEnd,
	onHoverChange,
	segments,
	className,
	children,
}: ScrubBarProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const draggingRef = useRef(false);
	const [hoverRatio, setHoverRatio] = useState<number | null>(null);
	const continuous = !segments;
	const segs = segments ?? SINGLE;

	const hoverFrom = (e: PointerEvent<HTMLDivElement>): ScrubHover | null => {
		const rect = trackRef.current?.getBoundingClientRect();
		if (!rect) return null;
		const x = e.clientX - rect.left;
		return { x, width: rect.width, ratio: clamp(x / rect.width, 0, 1) };
	};

	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		const p = hoverFrom(e);
		if (!p) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		draggingRef.current = true;
		onScrubStart?.();
		onScrub(p.ratio);
	};

	const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		const p = hoverFrom(e);
		if (!p) return;
		setHoverRatio(p.ratio);
		onHoverChange?.(p);
		if (e.currentTarget.hasPointerCapture(e.pointerId)) onScrub(p.ratio);
	};

	const endDrag = (e: PointerEvent<HTMLDivElement>) => {
		if (e.currentTarget.hasPointerCapture(e.pointerId))
			e.currentTarget.releasePointerCapture(e.pointerId);
		if (!draggingRef.current) return;
		draggingRef.current = false;
		onScrubEnd?.();
	};

	const onPointerLeave = () => {
		setHoverRatio(null);
		onHoverChange?.(null);
	};

	const starts = new Array<number>(segs.length);
	for (let i = 0, acc = 0; i < segs.length; i++) {
		starts[i] = acc;
		acc += segs[i].basis;
	}
	const fills = segs.map((seg, i) => {
		const start = starts[i];
		const at = (r: number) => clamp((r - start) / seg.basis, 0, 1);
		return {
			seg,
			fill: at(value),
			hover: hoverRatio == null ? 0 : at(hoverRatio),
		};
	});

	return (
		<div
			ref={trackRef}
			aria-label={ariaLabel}
			className={cn(
				"group relative flex h-5 cursor-pointer items-center",
				className,
			)}
			style={{ touchAction: "none" }}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endDrag}
			onPointerCancel={endDrag}
			onPointerLeave={onPointerLeave}
		>
			<div
				className={cn("flex h-1 w-full", continuous ? "gap-0" : "gap-[2px]")}
			>
				{fills.map(({ seg, fill, hover }) => (
					<div
						key={seg.id}
						className={cn(
							"relative h-full overflow-hidden bg-scrub-track",
							continuous && "rounded-full",
						)}
						style={{ flexBasis: `${seg.basis * 100}%` }}
					>
						<div
							className="absolute inset-y-0 left-0 bg-scrub-hover"
							style={{ width: `${hover * 100}%` }}
						/>
						<div
							className="absolute inset-y-0 left-0 bg-scrub-progress"
							style={{ width: `${fill * 100}%` }}
						/>
					</div>
				))}
			</div>
			<div
				className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-scrub-progress ring-2 ring-border"
				style={{ left: `${value * 100}%` }}
			/>
			{children}
		</div>
	);
}
