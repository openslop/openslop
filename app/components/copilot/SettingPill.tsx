"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icon";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";

export interface SettingPillOption<T extends string> {
	value: T;
	label: string;
}

/** The composer's pill face, for a setting whose picker is not a plain list. */
export function SettingPillButton({
	className,
	children,
	...props
}: ComponentProps<"button">) {
	return (
		<button
			type="button"
			className={cn(
				"focus-ring inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-body text-label whitespace-nowrap text-foreground transition-colors hover:bg-button-hover disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
		</button>
	);
}

/**
 * One composer setting: a pill showing the selected option, which opens the
 * picker for the rest. The pill's face and its accessible name both come from
 * the options, so they cannot drift from what the menu has checked.
 */
export function SettingPill<T extends string>({
	name,
	icon,
	value,
	options,
	onChange,
	disabled = false,
	className,
	style,
}: {
	name: string;
	icon?: ReactNode;
	value: T;
	options: SettingPillOption<T>[];
	onChange: (value: T) => void;
	/** Pinned to `value`: shown, greyed, and not openable. */
	disabled?: boolean;
	className?: string;
	style?: CSSProperties;
}) {
	const selected = options.find((option) => option.value === value);
	if (!selected) throw new Error(`${name} has no option for "${value}"`);

	return (
		<SelectMenu
			value={value}
			onChange={onChange}
			options={options}
			itemClassName="rounded-lg text-label-xs"
		>
			<SettingPillButton
				aria-label={`${name}: ${selected.label}`}
				disabled={disabled}
				className={className}
				style={style}
			>
				{icon}
				{selected.label}
			</SettingPillButton>
		</SelectMenu>
	);
}
