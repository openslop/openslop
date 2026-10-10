"use client";

import type * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"peer inline-flex h-3 w-5.5 shrink-0 cursor-pointer items-center rounded-full border border-switch bg-transparent transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-switch",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					"pointer-events-none block size-3 rounded-full border border-switch bg-element-card transition-transform data-[state=unchecked]:-translate-x-px data-[state=checked]:translate-x-2.25",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
