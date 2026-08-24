import * as React from "react";

import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SIZES = { sm: "h-5 w-5", header: "h-6 w-6", default: "h-7 w-7" } as const;

/**
 * A header-row button sits quiet among a card's other controls; at the larger
 * sizes these float over media and carry their own chip.
 */
export const LOOKS = {
	header: { icon: 14, chip: "" },
	default: { icon: 16, chip: "bg-muted" },
} as const;

export function IconButton({
	ariaLabel,
	size = "default",
	className,
	children,
	ref,
	...props
}: React.ComponentProps<"button"> & {
	ariaLabel: string;
	size?: keyof typeof SIZES;
}) {
	return (
		<button
			ref={ref}
			type="button"
			aria-label={ariaLabel}
			className={cn(
				"flex shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-button-hover focus-ring disabled:pointer-events-none disabled:opacity-40",
				SIZES[size],
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

/** An {@link IconButton} wrapped in a tooltip. `ariaLabel` defaults to `label`. */
export function TooltipIconButton({
	label,
	ariaLabel,
	...props
}: Omit<React.ComponentProps<typeof IconButton>, "ariaLabel"> & {
	label: string;
	ariaLabel?: string;
}) {
	return (
		<SimpleTooltip label={label}>
			<IconButton ariaLabel={ariaLabel ?? label} {...props} />
		</SimpleTooltip>
	);
}
