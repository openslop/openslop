"use client";

import {
	useRef,
	useState,
	type ComponentProps,
	type KeyboardEvent,
} from "react";
import { flushSync } from "react-dom";
import { usePointerDrag } from "@/lib/components/use-pointer-drag";
import { clamp } from "@/lib/utils";

/** Pointer travel, in px, that moves the value by one step. */
const PX_PER_STEP = 3;
const DRAG_THRESHOLD_PX = 3;

function quantize(
	value: number,
	min: number,
	max: number | undefined,
	step: number,
) {
	const decimals = (String(step).split(".")[1] ?? "").length;
	const snapped = Number((Math.round(value / step) * step).toFixed(decimals));
	return clamp(snapped, min, max ?? Infinity);
}

export type NumberScrubOptions = {
	value: number;
	min: number;
	/** Left out, the value has no ceiling. */
	max?: number;
	step: number;
	onChange: (value: number) => void;
	resetValue?: number;
};

export function useNumberScrub({
	value,
	min,
	max,
	step,
	onChange,
	resetValue,
}: NumberScrubOptions) {
	const [draft, setDraft] = useState<string | null>(null);
	const drag = useRef<{ x: number; y: number; from: number; moved: boolean }>(
		null,
	);
	const scrub = useRef<HTMLDivElement>(null);

	const commit = (next: string) => {
		const parsed = Number.parseFloat(next);
		if (!Number.isNaN(parsed)) onChange(quantize(parsed, min, max, step));
		setDraft(null);
	};
	const closeToValue = () => {
		flushSync(() => setDraft(null));
		scrub.current?.focus();
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
			if (event.key === "Enter" || event.key === "Escape") closeToValue();
		},
		onDoubleClick: () => {
			if (resetValue === undefined) return;
			onChange(resetValue);
			closeToValue();
		},
	} satisfies ComponentProps<"input">;

	const scrubProps = {
		ref: scrub,
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
