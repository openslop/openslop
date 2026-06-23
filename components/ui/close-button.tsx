import * as React from "react";
import { X } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function CloseButton({
	size = 16,
	className,
	ref,
	...props
}: React.ComponentProps<"button"> & { size?: number }) {
	return (
		<button
			ref={ref}
			type="button"
			aria-label="Close"
			className={cn(
				"inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-hover hover:text-foreground focus-ring",
				className,
			)}
			{...props}
		>
			<X size={size} />
		</button>
	);
}
