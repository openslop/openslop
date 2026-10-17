import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const fieldClassName =
	"rounded-md border border-border bg-input shadow-xs transition-colors outline-none hover:border-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 unavailable:cursor-not-allowed unavailable:opacity-50";

const inputVariants = cva(
	"flex w-full min-w-0 font-body text-foreground placeholder:text-muted-foreground",
	{
		variants: {
			variant: {
				default: fieldClassName,
				bare: "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
			},
			size: {
				default: "h-9 px-3 py-1 text-body",
				sm: "h-8 px-2.5 py-1 text-label",
				cta: "h-11 px-3 py-1 text-body",
				heading: "px-1 py-0.5 text-heading leading-tight font-medium",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Input({
	className,
	type,
	variant,
	size,
	...props
}: Omit<React.ComponentProps<"input">, "size"> &
	VariantProps<typeof inputVariants>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(inputVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Input };
