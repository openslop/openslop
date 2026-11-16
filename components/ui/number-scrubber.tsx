"use client";

import type { IconComponent } from "@/components/ui/icon";
import { chipControlClassName } from "@/components/ui/chip-control";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useNumberScrub } from "@/components/ui/use-number-scrub";
import { cn } from "@/lib/utils";

/** Compact numeric field on the panel's toggle pill; see useNumberScrub. */
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
	const { editing, inputProps, scrubProps } = useNumberScrub({
		value,
		min,
		max,
		step,
		onChange,
	});

	const shell = cn(chipControlClassName, className);
	// Reserving the widest value keeps the box one size, whether it is showing
	// three digits, one, or an input.
	const valueWidth = `${String(max).length + suffix.length}ch`;
	const valueText = "text-right font-numeric text-label-xs";

	if (editing) {
		return (
			<div className={cn(shell, "ring-2 ring-ring")}>
				{Icon && <Icon size={ICON_SIZES.default} />}
				<input
					{...inputProps}
					aria-label={label}
					style={{ width: valueWidth }}
					className={cn(valueText, "bg-transparent outline-none")}
				/>
			</div>
		);
	}

	return (
		<SimpleTooltip label={tooltip ?? label}>
			<div
				{...scrubProps}
				tabIndex={0}
				aria-label={label}
				aria-valuetext={`${value}${suffix}`}
				className={cn(
					shell,
					"cursor-ew-resize touch-none select-none hover:bg-media-toggle-hover-bg",
				)}
			>
				{Icon && <Icon size={ICON_SIZES.default} />}
				<span className={valueText} style={{ minWidth: valueWidth }}>
					{value}
					{suffix}
				</span>
			</div>
		</SimpleTooltip>
	);
}
