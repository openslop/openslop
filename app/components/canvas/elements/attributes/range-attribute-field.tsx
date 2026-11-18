"use client";

import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { Slider } from "@/components/ui/slider";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { parseNumber } from "@/lib/canvas/element-attributes";
import type { GeneratedElement } from "@/lib/canvas/types";

/** A slider whose readout follows the drag; the value is written once, on release or per arrow key. */
export function RangeAttributeField({
	element,
	attrKey,
	value,
	label,
	format,
	min,
	max,
	step,
	fallback,
}: {
	element: GeneratedElement;
	attrKey: string;
	value: string;
	label: string;
	format: (value: string) => string;
	min: number;
	max: number;
	step: number;
	/** Where the thumb rests while the element has no value. */
	fallback?: string;
}) {
	const editor = useSlateStatic();
	const [dragged, setDragged] = useState<number>();
	// Any new value, the drag's own commit or an undo, ends the drag so the thumb follows it.
	const [shown, setShown] = useState(value);
	if (shown !== value) {
		setShown(value);
		setDragged(undefined);
	}
	const position =
		dragged ?? parseNumber(value) ?? parseNumber(fallback) ?? min;

	const commit = ([next]: number[]) => {
		if (String(next) !== value)
			mergeAttrs(editor, element.id, { [attrKey]: String(next) });
	};

	return (
		<div className="flex w-full items-center gap-3">
			<Slider
				min={min}
				max={max}
				step={step}
				value={[position]}
				onValueChange={([next]) => setDragged(next)}
				onValueCommit={commit}
				aria-label={label}
			/>
			<span className="shrink-0 text-right font-numeric text-label">
				{format(dragged === undefined ? value : String(dragged))}
			</span>
		</div>
	);
}
