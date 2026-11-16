"use client";

import * as React from "react";

import { TooltipIconButton } from "@/components/ui/icon-button";
import { useNumberScrub } from "@/components/ui/use-number-scrub";
import { cn } from "@/lib/utils";

const SEGMENT_HOVER = "rounded-sm hover:bg-media-toggle-hover-bg";

function Stepper({ className, ...props }: React.ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="stepper"
			className={cn(
				"inline-flex h-8 shrink-0 items-center rounded-md p-0.5 transition-colors hover:bg-button-hover",
				className,
			)}
			{...props}
		/>
	);
}

function StepperButton({
	className,
	...props
}: React.ComponentProps<typeof TooltipIconButton>) {
	return (
		<TooltipIconButton
			className={cn("size-7", SEGMENT_HOVER, className)}
			{...props}
		/>
	);
}

const VALUE =
	"h-7 min-w-12 px-1 font-numeric text-label text-foreground transition-colors focus-ring unavailable:opacity-40";

function StepperValue({ className, ...props }: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			className={cn(VALUE, SEGMENT_HOVER, className)}
			{...props}
		/>
	);
}

function StepperScrubValue({
	label,
	suffix,
	disabled,
	...scrub
}: Parameters<typeof useNumberScrub>[0] & {
	label: string;
	suffix: string;
	disabled: boolean;
}) {
	const { editing, inputProps, scrubProps } = useNumberScrub(scrub);
	const text = `${scrub.value}${suffix}`;

	if (editing) {
		return (
			<input
				{...inputProps}
				aria-label={label}
				className={cn(VALUE, "w-12 rounded-sm bg-transparent text-center")}
			/>
		);
	}
	return (
		<div
			{...scrubProps}
			tabIndex={disabled ? -1 : 0}
			aria-disabled={disabled}
			aria-label={label}
			aria-valuetext={text}
			className={cn(
				VALUE,
				SEGMENT_HOVER,
				"flex cursor-ew-resize touch-none select-none items-center justify-center unavailable:pointer-events-none",
			)}
		>
			{text}
		</div>
	);
}

export { Stepper, StepperButton, StepperScrubValue, StepperValue };
