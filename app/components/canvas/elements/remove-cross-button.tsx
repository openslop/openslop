"use client";

import { X } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Small cross pinned outside an item's top-right corner — the shared removal
 * affordance for pills and tiles. Callers pass their own reveal classes
 * (e.g. `opacity-0 group-hover/pill:opacity-100`).
 */
export function RemoveCrossButton({
	label,
	onClick,
	className,
}: {
	label: string;
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onClick}
			className={cn(
				"focus-ring absolute -right-1 -top-1 flex cursor-pointer items-center justify-center rounded-full border border-border bg-popover p-0.5 transition-opacity hover:bg-muted focus-visible:opacity-100",
				className,
			)}
		>
			<X className="h-2.5 w-2.5 text-foreground" />
		</button>
	);
}
