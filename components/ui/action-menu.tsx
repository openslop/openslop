"use client";

import { type ReactNode } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
	key: string;
	label: ReactNode;
	icon?: ReactNode;
	onSelect: () => void;
	disabled?: boolean;
}

export function ActionMenu({
	items,
	children,
	side = "bottom",
	align = "start",
	contentClassName,
	itemClassName,
	onOpenChange,
}: {
	items: ActionMenuItem[];
	children: ReactNode;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	contentClassName?: string;
	itemClassName?: string;
	onOpenChange?: (open: boolean) => void;
}) {
	return (
		<DropdownMenu modal={false} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent
				side={side}
				align={align}
				className={contentClassName}
			>
				{items.map((item) => (
					<DropdownMenuItem
						key={item.key}
						onSelect={item.onSelect}
						disabled={item.disabled}
						className={cn("cursor-pointer", itemClassName)}
					>
						{item.icon}
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
