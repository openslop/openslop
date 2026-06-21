import * as React from "react";
import { X } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const CloseButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> & { size?: number }
>(function CloseButton({ size = 16, className, ...props }, ref) {
	return (
		<button
			ref={ref}
			type="button"
			aria-label="Close"
			className={cn(
				"rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
				className,
			)}
			{...props}
		>
			<X size={size} />
		</button>
	);
});
