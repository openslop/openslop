import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
	"flex w-full min-w-0 rounded-md font-body text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/30",
	{
		variants: {
			variant: {
				default:
					"border border-border bg-input shadow-xs hover:border-ring/50 focus-visible:border-ring aria-invalid:border-destructive",
				bare: "bg-transparent",
			},
			size: {
				default: "h-9 px-3 py-1 text-body",
				sm: "h-8 px-2.5 py-1 text-label",
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
