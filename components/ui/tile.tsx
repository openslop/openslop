import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * One row of a list inside a panel or a dialog: the recessed element-card
 * surface, not the raised `Card`, so a list of them reads as content rather
 * than as a stack of floating panes.
 */
export function Tile({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="tile"
			className={cn(
				"flex flex-col gap-3 rounded-xl border border-border bg-element-card p-3",
				className,
			)}
			{...props}
		/>
	);
}
