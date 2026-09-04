"use client";

import { type ComponentProps, type ReactNode } from "react";
import { Check, ChevronDown } from "@/components/ui/icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { selectTriggerClassName } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectMenuOption<T extends string> {
	value: T;
	label: ReactNode;
	icon?: ReactNode;
}

/**
 * One menu row in a picker: a fixed check gutter so labels line up whether or
 * not the row is selected. `closeOnSelect={false}` keeps the menu open, for
 * pickers that toggle several values in a row.
 */
export function SelectMenuItem({
	selected,
	onSelect,
	closeOnSelect = true,
	className,
	children,
}: {
	selected: boolean;
	onSelect: () => void;
	closeOnSelect?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<DropdownMenuItem
			onSelect={(event) => {
				if (!closeOnSelect) event.preventDefault();
				onSelect();
			}}
			className={cn("cursor-pointer py-1 text-label", className)}
		>
			<span className="flex w-3.5 shrink-0 items-center justify-center">
				{selected && (
					<Check className="h-3 w-3 text-accent" aria-hidden="true" />
				)}
			</span>
			{children}
		</DropdownMenuItem>
	);
}

/** A control that sits inline with text: a badge on an element, a button in a composer. */
export const inlineControlClassName =
	"focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

/** Mousedown is swallowed so opening a picker never moves the caret out of the text it sits in. */
export function InlineMenuTrigger({
	className,
	children,
	...props
}: ComponentProps<"button">) {
	return (
		<button
			type="button"
			onMouseDown={(event) => event.preventDefault()}
			className={cn(inlineControlClassName, "max-w-[140px]", className)}
			{...props}
		>
			{children}
			<ChevronDown
				className="h-3 w-3 shrink-0 text-muted-foreground"
				aria-hidden="true"
			/>
		</button>
	);
}

/** The Select trigger's face on a menu, for a picker whose rows are richer than a Select's. */
export function SelectMenuTrigger({
	className,
	children,
	...props
}: ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-size="sm"
			className={cn(
				selectTriggerClassName,
				"px-2.5 hover:bg-surface-hover",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronDown className="opacity-60" aria-hidden="true" />
		</button>
	);
}

/**
 * Picker hung off a trigger you supply as `children`, with menu semantics.
 * Use where the trigger is part of the surface (a badge, a toolbar button).
 *
 * For a standalone form field that renders its own trigger, use `SelectField`.
 */
export function SelectMenu<T extends string>({
	value,
	onChange,
	options,
	children,
	side = "bottom",
	align = "start",
	contentClassName,
	itemClassName,
}: {
	value: T;
	onChange: (value: T) => void;
	options: SelectMenuOption<T>[];
	children: ReactNode;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	contentClassName?: string;
	itemClassName?: string;
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
					<SelectMenuItem
						key={option.value}
						selected={option.value === value}
						onSelect={() => onChange(option.value)}
						className={itemClassName}
					>
						{option.icon}
						{option.label}
					</SelectMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
