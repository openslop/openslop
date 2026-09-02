import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { SimpleTooltip } from "@/components/ui/tooltip";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body font-medium transition-[color,background-color,border-color,box-shadow,filter] focus-ring disabled:pointer-events-none aria-disabled:cursor-default unavailable:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:brightness-110 active:brightness-95",
				accent:
					"bg-accent text-accent-foreground hover:brightness-110 active:brightness-95",
				secondary:
					"border border-border bg-secondary text-secondary-foreground hover:bg-button-hover",
				outline: "border border-border bg-transparent hover:bg-button-hover",
				ghost: "hover:bg-button-hover hover:text-foreground",
				/** The side panel's quiet look, for chrome next to a primary action. */
				panel:
					"text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
				destructive:
					"bg-destructive text-destructive-foreground hover:brightness-110 active:brightness-95",
				generate:
					"bg-generate text-generate-foreground hover:bg-generate-hover unavailable:bg-generate-disabled unavailable:text-generate-disabled-foreground unavailable:opacity-100 unavailable:hover:bg-generate-disabled",
				link: "text-accent underline-offset-4 hover:underline",
			},
			size: {
				xs: "h-6 gap-1 rounded-md px-2 text-label [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 rounded-md px-3 text-label",
				default: "h-9 px-4",
				/** Auth and hero call to action; pair with `w-full`. */
				cta: "h-11 px-4",
				lg: "h-11 px-6 text-body-lg",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	tooltip,
	tooltipSide,
	unavailable,
	onClick,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		tooltip?: string;
		tooltipSide?: React.ComponentProps<typeof SimpleTooltip>["side"];
		/** Inert, but still hoverable so a tooltip can explain why. */
		unavailable?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";
	const button = (
		<Comp
			data-slot="button"
			aria-label={tooltip}
			className={cn(buttonVariants({ variant, size, className }))}
			aria-disabled={unavailable || undefined}
			onClick={unavailable ? undefined : onClick}
			{...props}
		/>
	);
	if (tooltip == null) return button;
	return (
		<SimpleTooltip label={tooltip} side={tooltipSide}>
			{button}
		</SimpleTooltip>
	);
}

export { Button, buttonVariants };
