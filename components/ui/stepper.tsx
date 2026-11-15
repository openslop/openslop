import * as React from "react";

import { TooltipIconButton } from "@/components/ui/icon-button";
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

function StepperValue({ className, ...props }: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			className={cn(
				"h-7 min-w-12 px-1 font-numeric text-label text-foreground transition-colors focus-ring unavailable:opacity-40",
				SEGMENT_HOVER,
				className,
			)}
			{...props}
		/>
	);
}

export { Stepper, StepperButton, StepperValue };
