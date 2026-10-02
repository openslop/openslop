"use client";

import {
	type CSSProperties,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useMemo,
	useRef,
	useState,
} from "react";
import { usePointerDrag } from "@/lib/components/usePointerDrag";
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
	/** Fired with the 0–1 ratio on press, during drag, and on a slider key. */
	onScrub: (ratio: number) => void;
	/** How far one arrow key moves the value, as a 0–1 ratio. */
	keyStep: number;
	onScrubStart?: () => void;
	onScrubEnd?: () => void;
	/** Reports hover position (or null on leave) — e.g. to drive a tooltip. */
	onHoverChange?: (hover: ScrubHover | null) => void;
	/** Segmented layout; none is a single continuous track. */
	segments?: ScrubSegment[];
	/** Dims the track and takes it out of the pointer and tab path. */
	disabled?: boolean;
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
	return segs.map(({ basis }) => {
		const style = {
			flexBasis: `${basis * 100}%`,
			"--seg-start": start,
			"--seg-scale": basis > 0 ? 1 / basis : 0,
		} as CSSProperties;
		start += basis;
		return style;
	});
}

/** Where a slider key moves the value, or null for a key the slider ignores. */
export function scrubKeyTarget(
	key: string,
	value: number,
	step: number,
): number | null {
	switch (key) {
		case "ArrowRight":
		case "ArrowUp":
			return clamp(value + step, 0, 1);
		case "ArrowLeft":
		case "ArrowDown":
			return clamp(value - step, 0, 1);
		case "Home":
			return 0;
		case "End":
			return 1;
		default:
			return null;
	}
}

/**
 * Shared slider track used by both the seek bar (segmented) and the volume
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
	keyStep,
	onScrubStart,
	onScrubEnd,
	onHoverChange,
	segments,
	disabled,
	className,
	children,
}: ScrubBarProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [hoverRatio, setHoverRatio] = useState<number | null>(null);
	const continuous = !segments?.length;
	const parts = continuous ? SINGLE : segments;

	const hoverFrom = (event: PointerEvent<HTMLElement>): ScrubHover | null => {
		const rect = trackRef.current?.getBoundingClientRect();
		if (!rect) return null;
		const x = event.clientX - rect.left;
		return { x, width: rect.width, ratio: clamp(x / rect.width, 0, 1) };
	};

	const drag = usePointerDrag({
		onStart: onScrubStart,
		onMove: (event) => {
			const hover = hoverFrom(event);
			if (hover) onScrub(hover.ratio);
		},
		onEnd: onScrubEnd,
	});

	const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const hover = hoverFrom(event);
		if (hover) {
			setHoverRatio(hover.ratio);
			onHoverChange?.(hover);
		}
		drag.onPointerMove(event);
	};

	const onPointerLeave = () => {
		setHoverRatio(null);
		onHoverChange?.(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const target = scrubKeyTarget(event.key, value, keyStep);
		if (target === null) return;
		event.preventDefault();
		onScrubStart?.();
		onScrub(target);
		onScrubEnd?.();
	};

	const track = useMemo(() => {
		const styles = segmentStyle(parts);
		return (
			<div
				className={cn("flex h-1 w-full", continuous ? "gap-0" : "gap-[2px]")}
			>
				{parts.map(({ id }, index) => (
					<div
						key={id}
						className={cn(
							"relative h-full overflow-hidden bg-scrub-track",
							continuous && "rounded-full",
						)}
						style={styles[index]}
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
	}, [parts, continuous]);

	return (
		<div
			ref={trackRef}
			role="slider"
			tabIndex={disabled ? -1 : 0}
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(value * 100)}
			aria-disabled={disabled || undefined}
			className={cn(
				"group relative flex touch-none items-center rounded-md focus-ring",
				disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
				SCRUB_BAR_HEIGHT,
				className,
			)}
			style={
				{
					"--scrub-pos": value,
					"--scrub-preview": hoverRatio ?? 0,
				} as CSSProperties
			}
			{...drag}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			onKeyDown={disabled ? undefined : onKeyDown}
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
