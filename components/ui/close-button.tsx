import type * as React from "react";
import { X } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";

/** Closes the surface it sits on; looks like every header action beside it. */
export function CloseButton(
	props: Omit<
		React.ComponentProps<typeof IconButton>,
		"ariaLabel" | "variant" | "size"
	>,
) {
	return (
		<IconButton ariaLabel="Close" variant="inherit" {...props}>
			<X />
		</IconButton>
	);
}
