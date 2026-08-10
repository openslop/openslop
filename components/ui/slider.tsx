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
				"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted"
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className="absolute h-full bg-accent"
				/>
			</SliderPrimitive.Track>
			{Array.from({ length: values.length }, (_, i) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={i}
					aria-label={ariaLabel}
					className="block size-3.5 shrink-0 rounded-full border border-border bg-card shadow-elevation-1 transition-colors focus-ring disabled:pointer-events-none"
				/>
			))}
		</SliderPrimitive.Root>
	);
}

export { Slider };
