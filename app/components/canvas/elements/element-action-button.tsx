"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { keepFocus } from "@/components/ui/keep-focus";
import { cn } from "@/lib/utils";

/** An element card's action: icon plus a label that collapses to icon-only on a narrow card. */
export function ElementActionButton({
	icon,
	label,
	variant = "ghost",
	className,
	...props
}: Omit<ComponentProps<typeof Button>, "children" | "size" | "type"> & {
	icon: ReactNode;
	label: string;
}) {
	return (
		<Button
			type="button"
			variant={variant}
			size="sm"
			className={cn("shrink-0", className)}
			aria-label={label}
			onMouseDown={keepFocus}
			{...props}
		>
			{icon}
			<span className="@max-sm/element:hidden">{label}</span>
		</Button>
	);
}
