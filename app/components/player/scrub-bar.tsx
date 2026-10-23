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
import chunk from "lodash/chunk";
import { sliderKeyTarget } from "@/lib/components/slider-keys";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import { clamp, cn } from "@/lib/utils";

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
	/** What a screen reader says for the value; the percent when absent. */
	ariaValueText?: string;
	/** Fired with the 0–1 ratio on press, during drag, and on a slider key. */
	onScrub: (ratio: number) => void;
	/** How far one arrow key moves the value, as a 0–1 ratio. */
	keyStep: number;
	onScrubStart?: () => void;
	onScrubEnd?: () => void;
	/** Reports hover position (or null on leave) — e.g. to drive a tooltip. */
	onHoverChange?: (hover: ScrubHover | null) => void;
	/** Fractions (0–1) where the track breaks, such as scene boundaries. */
	breaks?: readonly number[];
	/** Dims the track and takes it out of the pointer and tab path. */
	disabled?: boolean;
	/** Sizing for the interactive container (width, optional height override). */
	className?: string;
	children?: ReactNode;
}

/** Height of the interactive track; callers reserve this to avoid layout shift. */
export const SCRUB_BAR_HEIGHT = "h-5";

const NO_BREAKS: readonly number[] = [];
const BREAK_HALF_WIDTH_PX = 1;
// Chrome misplaces hard stops in a gradient with more than ~128 stops (4 per break).
const BREAKS_PER_MASK_LAYER = 30;

const fillTo = (ratio: string): CSSProperties => ({
	width: `calc(var(${ratio}) * 100%)`,
});

const previewFill = fillTo("--scrub-preview");
const progressFill = fillTo("--scrub-pos");
const thumbStyle: CSSProperties = { left: "calc(var(--scrub-pos) * 100%)" };

function notchLayer(breaks: readonly number[]): string {
	const notches = breaks.flatMap((at) => {
		const before = `calc(${at * 100}% - ${BREAK_HALF_WIDTH_PX}px)`;
		const after = `calc(${at * 100}% + ${BREAK_HALF_WIDTH_PX}px)`;
		return [
			`#000 ${before}`,
			`transparent ${before}`,
			`transparent ${after}`,
			`#000 ${after}`,
		];
	});
	return `linear-gradient(to right, ${["#000", ...notches, "#000"].join(", ")})`;
}

/**
 * Cuts a transparent notch at each break without taking width from the track,
 * as layers the track intersects.
 */
export function breakMask(breaks: readonly number[]): string {
	return (
		chunk(breaks, BREAKS_PER_MASK_LAYER).map(notchLayer).join(", ") || "none"
	);
}

/**
 * Shared slider track used by both the seek bar and the volume bar. Renders a
 * rest track, a hover preview fill, a progress fill, and a thumb, all driven by
 * the `--scrub-*` tokens on one linear scale; breaks only mask the track.
 *
 * `value` and the hover ratio reach the DOM as `--scrub-pos` / `--scrub-preview`
 * on the root, so the track below stays referentially stable while the
 * playhead moves.
 */
export function ScrubBar({
	value,
	ariaLabel,
	ariaValueText,
	onScrub,
	keyStep,
	onScrubStart,
	onScrubEnd,
	onHoverChange,
	breaks = NO_BREAKS,
	disabled,
	className,
	children,
}: ScrubBarProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [hoverRatio, setHoverRatio] = useState<number | null>(null);

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
		const target = sliderKeyTarget(event.key, value, keyStep);
		if (target === null) return;
		event.preventDefault();
		onScrubStart?.();
		onScrub(target);
		onScrubEnd?.();
	};

	const track = useMemo(() => {
		return (
			<div
				className="relative h-1 w-full overflow-hidden rounded-full bg-scrub-track mask-intersect"
				style={{ maskImage: breakMask(breaks) }}
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
		);
	}, [breaks]);

	return (
		<div
			ref={trackRef}
			role="slider"
			tabIndex={disabled ? -1 : 0}
			aria-label={ariaLabel}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(value * 100)}
			aria-valuetext={ariaValueText}
			aria-disabled={disabled || undefined}
			className={cn(
				"group relative flex cursor-pointer touch-none items-center rounded-md focus-ring unavailable:pointer-events-none unavailable:opacity-50",
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
