"use client";

import { type ReactNode } from "react";
import { Check } from "@/components/ui/icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SelectMenuOption<T extends string> {
	value: T;
	label: ReactNode;
	icon?: ReactNode;
}

export function SelectMenu<T extends string>({
	value,
	onChange,
	options,
	children,
	side = "bottom",
	align = "start",
	contentClassName,
}: {
	value: T;
	onChange: (value: T) => void;
	options: SelectMenuOption<T>[];
	children: ReactNode;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	contentClassName?: string;
}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent
				side={side}
				align={align}
				className={cn("min-w-32", contentClassName)}
			>
				{options.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onSelect={() => onChange(option.value)}
						className="cursor-pointer py-1 text-[11px] text-muted-foreground"
					>
						<span className="flex w-3.5 shrink-0 items-center justify-center">
							{option.value === value && (
								<Check className="h-3 w-3 text-accent" aria-hidden="true" />
							)}
						</span>
						{option.icon}
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
