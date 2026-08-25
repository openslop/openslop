import type { ComponentProps } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

/** Pressing a header button must not take the caret from the element's text. */
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
