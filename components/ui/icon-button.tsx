import * as React from "react";

import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const VARIANTS = {
	default: "text-foreground",
	/** Takes the color of the text it sits beside. */
	inherit: "hover:text-foreground",
	quiet: "text-muted-foreground hover:text-foreground",
	/** The side panel's heading color. */
	panel: "text-panel-label",
	destructive:
		"text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20",
	onMedia: "bg-on-media/70 text-on-media-foreground hover:bg-on-media/80",
} as const;

const SHAPES = { square: "rounded-md", round: "rounded-full" } as const;

/** `sm` fits where the room is fixed: on media, in a pill, in a ruler. */
const SIZES = {
	default: "size-8 [&_.icon]:size-4 [&_svg]:size-4",
	sm: "size-6 [&_.icon]:size-3.5 [&_svg]:size-3.5",
} as const;

/** Icon sizes by role; an {@link IconButton} draws its icon at `default`, or `header` when `sm`. */
export const ICON_SIZES = { sm: 12, header: 14, default: 16 } as const;

export function IconButton({
	ariaLabel,
	variant = "default",
	shape = "square",
	size = "default",
	chip,
	className,
	unavailable,
	onClick,
	children,
	ref,
	...props
}: React.ComponentProps<"button"> & {
	ariaLabel: string;
	variant?: keyof typeof VARIANTS;
	shape?: keyof typeof SHAPES;
	size?: keyof typeof SIZES;
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
