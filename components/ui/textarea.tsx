import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
	"flex w-full rounded-md border border-border bg-input font-body text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground hover:border-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
	{
		variants: {
			size: {
				default: "min-h-20 px-3 py-2 text-body",
				sm: "px-2.5 py-1.5 text-label",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

function Textarea({
	className,
	size,
	...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(textareaVariants({ size }), className)}
			{...props}
		/>
	);
}

export { Textarea };
