import * as React from "react";

import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SIZES = { sm: "h-5 w-5", header: "h-6 w-6", default: "h-7 w-7" } as const;

const VARIANTS = {
	default: "text-foreground",
	quiet: "text-muted-foreground hover:text-foreground",
	destructive:
		"text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20",
} as const;

const SHAPES = { square: "rounded-md", round: "rounded-full" } as const;

/** The icon that fills each {@link IconButton} size. */
export const ICON_SIZES = { sm: 12, header: 14, default: 16 } as const;

export function IconButton({
	ariaLabel,
	size = "default",
	variant = "default",
	shape = "square",
	chip,
	className,
	unavailable,
	onClick,
	children,
	ref,
	...props
}: React.ComponentProps<"button"> & {
	ariaLabel: string;
	size?: keyof typeof SIZES;
	variant?: keyof typeof VARIANTS;
	shape?: keyof typeof SHAPES;
	/** Carries its own backdrop. */
	chip?: boolean;
	/** Inert, but still hoverable so a tooltip can explain why. */
	unavailable?: boolean;
}) {
	return (
		<button
			ref={ref}
			type="button"
			aria-label={ariaLabel}
			className={cn(
				"flex shrink-0 items-center justify-center transition-colors hover:bg-button-hover focus-ring disabled:pointer-events-none unavailable:opacity-40",
				SIZES[size],
				VARIANTS[variant],
				SHAPES[shape],
				chip && "bg-muted",
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
