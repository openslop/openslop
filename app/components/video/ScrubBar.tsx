"use client";

import {
	type CSSProperties,
	type PointerEvent,
	type ReactNode,
	useMemo,
	useRef,
	useState,
} from "react";
import { clamp, cn } from "@/lib/utils";

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

/** Height of the interactive track; callers reserve this to avoid layout shift. */
export const SCRUB_BAR_HEIGHT = "h-5";

const SINGLE: ScrubSegment[] = [{ id: "_", basis: 1 }];

/**
 * A segment's fill is the track-wide ratio mapped into the segment's own span:
 * `clamp((ratio - start) / basis, 0, 1)`, expressed so the browser recomputes it
 * from one variable write instead of a React render per value change.
 */
const fillFrom = (ratio: string): CSSProperties => ({
	width: `clamp(0%, calc((var(${ratio}) - var(--seg-start)) * var(--seg-scale) * 100%), 100%)`,
});

const previewFill = fillFrom("--scrub-preview");
const progressFill = fillFrom("--scrub-pos");
const thumbStyle: CSSProperties = { left: "calc(var(--scrub-pos) * 100%)" };

export function segmentStyle(segs: readonly ScrubSegment[]): CSSProperties[] {
	let start = 0;
	return segs.map((seg) => {
		const style = {
			flexBasis: `${seg.basis * 100}%`,
			"--seg-start": start,
			"--seg-scale": seg.basis > 0 ? 1 / seg.basis : 0,
		} as CSSProperties;
		start += seg.basis;
		return style;
	});
}

/**
 * Shared draggable track used by both the seek bar (segmented) and the volume
 * bar (continuous). Renders a rest track, a hover preview fill, a progress
 * fill, and a thumb — all driven by the `--scrub-*` tokens.
 *
 * `value` and the hover ratio reach the DOM as `--scrub-pos` / `--scrub-preview`
 * on the root, so the segment elements below stay referentially stable while the
 * playhead moves.
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

	const track = useMemo(() => {
		const styles = segmentStyle(segs);
		return (
			<div
				className={cn("flex h-1 w-full", continuous ? "gap-0" : "gap-[2px]")}
			>
				{segs.map((seg, i) => (
					<div
						key={seg.id}
						className={cn(
							"relative h-full overflow-hidden bg-scrub-track",
							continuous && "rounded-full",
						)}
						style={styles[i]}
					>
						<div
							className="absolute inset-y-0 left-0 bg-scrub-hover"
							style={previewFill}
						/>
						<div
							className="absolute inset-y-0 left-0 bg-scrub-progress"
							style={progressFill}
						/>
					</div>
				))}
			</div>
		);
	}, [segs, continuous]);

	return (
		<div
			ref={trackRef}
			aria-label={ariaLabel}
			className={cn(
				"group relative flex cursor-pointer items-center",
				SCRUB_BAR_HEIGHT,
				className,
			)}
			style={
				{
					touchAction: "none",
					"--scrub-pos": value,
					"--scrub-preview": hoverRatio ?? 0,
				} as CSSProperties
			}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endDrag}
			onPointerCancel={endDrag}
			onPointerLeave={onPointerLeave}
		>
			{track}
			<div
				className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-scrub-progress ring-2 ring-border"
				style={thumbStyle}
			/>
			{children}
		</div>
	);
}
