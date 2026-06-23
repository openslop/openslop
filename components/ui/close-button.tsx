import * as React from "react";
import { X } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function CloseButton({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			aria-label="Close"
			className={cn(
				"inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-hover hover:text-foreground focus-ring",
				className,
			)}
			{...props}
		>
			<X size={16} />
		</button>
	);
}
