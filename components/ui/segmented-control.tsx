"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export type SegmentedControlOption<T extends string> = {
	value: T;
	label: string;
};

/**
 * Segmented control for picking one of a few labelled choices, sized for a
 * prominent surface. For the compact icon-and-glyph pill that sits on media,
 * use {@link MediaToggle}. Radio semantics and arrow-key roving come from the
 * underlying toggle group.
 */
export function SegmentedControl<T extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	className,
}: {
	value: T;
	options: readonly SegmentedControlOption<T>[];
	onChange: (value: T) => void;
	ariaLabel: string;
	className?: string;
}) {
	return (
		<ToggleGroupPrimitive.Root
			type="single"
			aria-label={ariaLabel}
			value={value}
			// Radix clears the value when the active segment is pressed again; a
			// segmented control always keeps one selected.
			onValueChange={(next) => next && onChange(next as T)}
			className={cn(
				"inline-flex w-fit items-center gap-1 rounded-lg bg-surface-recessed p-1",
				className,
			)}
		>
			{options.map((option) => (
				<ToggleGroupPrimitive.Item
					key={option.value}
					value={option.value}
					className="focus-ring inline-flex items-center justify-center rounded-md px-3 py-1 font-body text-label font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-elevation-1"
				>
					{option.label}
				</ToggleGroupPrimitive.Item>
			))}
		</ToggleGroupPrimitive.Root>
	);
}
