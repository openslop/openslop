import type { ComponentProps } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

/**
 * The quiet icon button the element header row is built from. Keeps the caret
 * where it is: pressing one must not take selection from the element's text.
 */
export function HeaderIconButton({
	className,
	onMouseDown,
	...props
}: ComponentProps<typeof IconButton>) {
	return (
		<IconButton
			size="header"
			className={cn("text-muted-foreground hover:text-foreground", className)}
			onMouseDown={(e) => {
				e.preventDefault();
				onMouseDown?.(e);
			}}
			{...props}
		/>
	);
}
