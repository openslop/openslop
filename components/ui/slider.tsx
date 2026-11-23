"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	"aria-label": ariaLabel,
	...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
	const values = React.useMemo(
		() =>
			Array.isArray(value)
				? value
				: Array.isArray(defaultValue)
					? defaultValue
					: [min, max],
		[value, defaultValue, min, max],
	);

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				"group relative flex h-6 w-full cursor-pointer touch-none items-center select-none data-[disabled]:cursor-default data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className="relative h-px w-full grow overflow-hidden rounded-full bg-scrub-track"
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className="absolute h-full bg-scrub-progress"
				/>
			</SliderPrimitive.Track>
			{Array.from({ length: values.length }, (_, i) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={i}
					aria-label={ariaLabel}
					className="block size-2.5 shrink-0 cursor-ew-resize rounded-full bg-scrub-progress transition-transform group-hover:scale-125 active:scale-125 focus-ring disabled:pointer-events-none"
				/>
			))}
		</SliderPrimitive.Root>
	);
}

/** A slider with its value read out beside it, in room kept for `widest` so the track never shifts. */
function SliderField({
	readout,
	widest,
	...props
}: React.ComponentProps<typeof Slider> & { readout: string; widest: string }) {
	return (
		<div className="flex h-8 w-full items-center gap-3">
			<Slider {...props} />
			<span
				className="shrink-0 text-right font-numeric text-label"
				style={{ width: `${widest.length}ch` }}
			>
				{readout}
			</span>
		</div>
	);
}

export { Slider, SliderField };
