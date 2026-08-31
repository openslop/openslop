"use client";

import type * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Runs edge to edge inside a `p-3` surface, past the padding its siblings sit in. */
const BLEED = "-mx-3 my-2 data-[orientation=horizontal]:w-[calc(100%+1.5rem)]";

function Separator({
	className,
	bleed = false,
	orientation = "horizontal",
	decorative = true,
	...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
	bleed?: boolean;
}) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
				bleed && BLEED,
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
