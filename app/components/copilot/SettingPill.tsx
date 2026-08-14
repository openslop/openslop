"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icon";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";

export interface SettingPillOption<T extends string> {
	value: T;
	label: string;
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
	className,
	style,
}: {
	name: string;
	icon?: ReactNode;
	value: T;
	options: SettingPillOption<T>[];
	onChange: (value: T) => void;
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
			<button
				type="button"
				aria-label={`${name}: ${selected.label}`}
				className={cn(
					"focus-ring inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-body text-label text-foreground transition-colors hover:bg-button-hover",
					className,
				)}
				style={style}
			>
				{icon}
				{selected.label}
				<ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
			</button>
		</SelectMenu>
	);
}
