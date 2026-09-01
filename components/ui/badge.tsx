import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border font-medium whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "border-transparent bg-secondary text-secondary-foreground",
				outline: "border-border text-foreground",
				accent: "border-transparent bg-accent text-accent-foreground",
				success: "border-transparent bg-success text-success-foreground",
				caution: "border-transparent bg-caution text-caution-foreground",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground",
				new: "border-transparent bg-accent-soft text-accent",
				tertiary: "border-tertiary/50 bg-tertiary/10 text-tertiary",
			},
			size: {
				default: "px-2 py-0.5 text-label [&_svg:not([class*='size-'])]:size-3",
				sm: "gap-1 px-1.5 py-0 text-badge-xs [&_svg:not([class*='size-'])]:size-2.5",
				/** Only an icon, so it needs room rather than a text box. */
				icon: "size-6 rounded-md p-0 [&_svg:not([class*='size-'])]:size-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Badge({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "span";
	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
