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
	unavailable,
	onClick,
	children,
	ref,
	...props
}: React.ComponentProps<"button"> & {
	ariaLabel: string;
	size?: keyof typeof SIZES;
	/** Inert, but still hoverable so a tooltip can explain why. */
	unavailable?: boolean;
}) {
	return (
		<button
			ref={ref}
			type="button"
			aria-label={ariaLabel}
			className={cn(
				"flex shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-button-hover focus-ring disabled:pointer-events-none unavailable:opacity-40",
				SIZES[size],
				className,
			)}
			aria-disabled={unavailable || undefined}
			onClick={unavailable ? undefined : onClick}
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
	side,
	...props
}: Omit<React.ComponentProps<typeof IconButton>, "ariaLabel"> & {
	label: string;
	ariaLabel?: string;
	side?: React.ComponentProps<typeof SimpleTooltip>["side"];
}) {
	return (
		<SimpleTooltip label={label} side={side}>
			<IconButton ariaLabel={ariaLabel ?? label} {...props} />
		</SimpleTooltip>
	);
}
