"use client";

import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { SliderField } from "@/components/ui/slider";
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
	fallback,
}: {
	element: GeneratedElement;
	attrKey: string;
	value: string;
	label: string;
	format: (value: string) => string;
	min: number;
	max: number;
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
		<SliderField
			min={min}
			max={max}
			value={[position]}
			onValueChange={([next]) => setDragged(next)}
			onValueCommit={commit}
			aria-label={label}
			readout={format(dragged === undefined ? value : String(dragged))}
			widest={format(String(max))}
		/>
	);
}
