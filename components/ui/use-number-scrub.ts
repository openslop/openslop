"use client";

import {
	useRef,
	useState,
	type ComponentProps,
	type KeyboardEvent,
} from "react";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import { clamp } from "@/lib/utils";

/** Pointer travel, in px, that moves the value by one step. */
const PX_PER_STEP = 3;
const DRAG_THRESHOLD_PX = 3;

function quantize(value: number, min: number, max: number, step: number) {
	const decimals = (String(step).split(".")[1] ?? "").length;
	const snapped = Number((Math.round(value / step) * step).toFixed(decimals));
	return clamp(snapped, min, max);
}

export function useNumberScrub({
	value,
	min,
	max,
	step,
	onChange,
	resetValue,
}: {
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (value: number) => void;
	resetValue?: number;
}) {
	const [draft, setDraft] = useState<string | null>(null);
	const drag = useRef<{ x: number; y: number; from: number; moved: boolean }>(
		null,
	);

	const commit = (next: string) => {
		const parsed = Number.parseFloat(next);
		if (!Number.isNaN(parsed)) onChange(quantize(parsed, min, max, step));
		setDraft(null);
	};
	const nudge = (steps: number) =>
		onChange(quantize(value + steps * step, min, max, step));

	const inputProps = {
		autoFocus: true,
		autoComplete: "off",
		inputMode: "decimal",
		value: draft ?? "",
		onFocus: (event) => event.currentTarget.select(),
		onChange: (event) => setDraft(event.target.value),
		onBlur: (event) => commit(event.target.value),
		onKeyDown: (event) => {
			if (event.key === "Enter") commit(event.currentTarget.value);
			if (event.key === "Escape") setDraft(null);
		},
		onDoubleClick: () => {
			if (resetValue === undefined) return;
			setDraft(null);
			onChange(resetValue);
		},
	} satisfies ComponentProps<"input">;

	const scrubProps = {
		role: "spinbutton" as const,
		"aria-valuenow": value,
		"aria-valuemin": min,
		"aria-valuemax": max,
		...usePointerDrag({
			onStart: (event) => {
				drag.current = {
					x: event.clientX,
					y: event.clientY,
					from: value,
					moved: false,
				};
			},
			onMove: (event) => {
				const start = drag.current;
				if (!start) return;
				const travel = event.clientX - start.x - (event.clientY - start.y);
				if (Math.abs(travel) < DRAG_THRESHOLD_PX && !start.moved) return;
				start.moved = true;
				const next = quantize(
					start.from + (travel / PX_PER_STEP) * step,
					min,
					max,
					step,
				);
				if (next !== value) onChange(next);
			},
			onEnd: () => {
				if (drag.current && !drag.current.moved) setDraft(String(value));
				drag.current = null;
			},
		}),
		onKeyDown: (event: KeyboardEvent) => {
			if (event.key === "ArrowUp" || event.key === "ArrowRight") nudge(1);
			else if (event.key === "ArrowDown" || event.key === "ArrowLeft")
				nudge(-1);
			else if (event.key === "Enter") setDraft(String(value));
			else return;
			event.preventDefault();
		},
	};

	return { editing: draft !== null, inputProps, scrubProps };
}
