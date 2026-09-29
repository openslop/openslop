import type { ComponentProps } from "react";
import { IconButton } from "@/components/ui/icon-button";

/** Pressing a header button must not take the caret from the element's text. */
export function HeaderIconButton({
	onMouseDown,
	...props
}: ComponentProps<typeof IconButton>) {
	return (
		<IconButton
			size="header"
			variant="quiet"
			onMouseDown={(e) => {
				e.preventDefault();
				onMouseDown?.(e);
			}}
			{...props}
		/>
	);
}
