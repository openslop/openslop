import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { fieldClassName } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
	`${fieldClassName} flex w-full font-body text-foreground placeholder:text-muted-foreground`,
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
