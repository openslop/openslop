import * as React from "react";

import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const IconButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button"> & { ariaLabel: string }
>(function IconButton({ ariaLabel, className, children, ...props }, ref) {
	return (
		<button
			ref={ref}
			type="button"
			aria-label={ariaLabel}
			className={cn(
				"flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-button-hover focus-ring disabled:pointer-events-none disabled:opacity-40",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
});

/** An {@link IconButton} wrapped in a tooltip. `ariaLabel` defaults to `label`. */
export function TooltipIconButton({
	label,
	ariaLabel,
	...props
}: Omit<React.ComponentProps<typeof IconButton>, "ariaLabel"> & {
	label: string;
	ariaLabel?: string;
}) {
	return (
		<SimpleTooltip label={label}>
			<IconButton ariaLabel={ariaLabel ?? label} {...props} />
		</SimpleTooltip>
	);
}
