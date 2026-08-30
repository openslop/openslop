"use client";

import { useRef, useState } from "react";
import type { IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { clamp, cn } from "@/lib/utils";

/** Pointer travel, in px, that moves the value by one step. */
const PX_PER_STEP = 3;
const DRAG_THRESHOLD_PX = 3;

function quantize(value: number, min: number, max: number, step: number) {
	const decimals = (String(step).split(".")[1] ?? "").length;
	const snapped = Number((Math.round(value / step) * step).toFixed(decimals));
	return clamp(snapped, min, max);
}

/**
 * Compact numeric field: drag it horizontally or vertically to scrub, or click
 * to type an exact value. Arrow keys step it for keyboard and assistive use.
 */
export function NumberScrubber({
	value,
	min,
	max,
	step,
	onChange,
	label,
	tooltip,
	suffix = "",
	icon: Icon,
	className,
}: {
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (value: number) => void;
	label: string;
	/** Hover hint; defaults to the accessible label. */
	tooltip?: string;
	suffix?: string;
	icon?: IconComponent;
	className?: string;
}) {
	const [draft, setDraft] = useState<string | null>(null);
	const drag = useRef<{ x: number; y: number; from: number; moved: boolean }>(
		null,
	);

	const shell = cn(
		"flex h-6 items-center gap-1 rounded-md bg-media-toggle-bg px-2 text-media-toggle-fg transition-colors focus-ring",
		className,
	);
	// Reserving the widest value keeps the box one size, whether it is showing
	// three digits, one, or an input.
	const valueWidth = `${String(max).length + suffix.length}ch`;
	const valueText = "text-right font-numeric text-label-xs";

	if (draft !== null) {
		const commit = (next: string) => {
			const parsed = Number.parseFloat(next);
			if (!Number.isNaN(parsed)) onChange(quantize(parsed, min, max, step));
			setDraft(null);
		};
		return (
			<div className={cn(shell, "ring-2 ring-ring")}>
				{Icon && <Icon className="h-3.5 w-3.5" />}
				<input
					autoFocus
					aria-label={label}
					inputMode="decimal"
					value={draft}
					style={{ width: valueWidth }}
					onFocus={(event) => event.currentTarget.select()}
					onChange={(event) => setDraft(event.target.value)}
					onBlur={(event) => commit(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") commit(event.currentTarget.value);
						if (event.key === "Escape") setDraft(null);
					}}
					className={cn(valueText, "bg-transparent outline-none")}
				/>
			</div>
		);
	}

	const nudge = (steps: number) =>
		onChange(quantize(value + steps * step, min, max, step));

	return (
		<SimpleTooltip label={tooltip ?? label}>
			<div
				role="spinbutton"
				tabIndex={0}
				aria-label={label}
				aria-valuenow={value}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuetext={`${value}${suffix}`}
				onPointerDown={(event) => {
					event.currentTarget.setPointerCapture(event.pointerId);
					drag.current = {
						x: event.clientX,
						y: event.clientY,
						from: value,
						moved: false,
					};
				}}
				onPointerMove={(event) => {
					const start = drag.current;
					if (!start) return;
					const travel = event.clientX - start.x - (event.clientY - start.y);
					if (Math.abs(travel) < DRAG_THRESHOLD_PX && !start.moved) return;
					start.moved = true;
					onChange(
						quantize(
							start.from + (travel / PX_PER_STEP) * step,
							min,
							max,
							step,
						),
					);
				}}
				onPointerUp={() => {
					if (drag.current && !drag.current.moved) setDraft(String(value));
					drag.current = null;
				}}
				onKeyDown={(event) => {
					if (event.key === "ArrowUp" || event.key === "ArrowRight") nudge(1);
					else if (event.key === "ArrowDown" || event.key === "ArrowLeft")
						nudge(-1);
					else if (event.key === "Enter") setDraft(String(value));
					else return;
					event.preventDefault();
				}}
				className={cn(
					shell,
					"cursor-ew-resize touch-none select-none hover:bg-media-toggle-hover-bg",
				)}
			>
				{Icon && <Icon className="h-3.5 w-3.5" />}
				<span className={valueText} style={{ minWidth: valueWidth }}>
					{value}
					{suffix}
				</span>
			</div>
		</SimpleTooltip>
	);
}
