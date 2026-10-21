import * as React from "react";

import { cn } from "@/lib/utils";

/** Names a section of a surface: a popover, a settings pane, a nav group. */
export function SectionTitle({
	className,
	...props
}: React.ComponentProps<"h3">) {
	return (
		<h3
			className={cn("text-label font-semibold text-foreground", className)}
			{...props}
		/>
	);
}
