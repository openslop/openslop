import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { SimpleTooltip } from "@/components/ui/tooltip";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,filter] focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
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
				destructive:
					"bg-destructive text-destructive-foreground hover:brightness-110 active:brightness-95",
				generate:
					"bg-generate text-generate-foreground hover:bg-generate-hover disabled:bg-generate-disabled disabled:text-generate-disabled-foreground disabled:opacity-100",
				link: "text-accent underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 rounded-md px-3 text-xs",
				default: "h-9 px-4",
				lg: "h-11 px-6 text-base",
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
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		tooltip?: string;
	}) {
	const Comp = asChild ? Slot.Root : "button";
	const button = (
		<Comp
			data-slot="button"
			aria-label={tooltip}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
	if (tooltip == null) return button;
	return <SimpleTooltip label={tooltip}>{button}</SimpleTooltip>;
}

export { Button, buttonVariants };
