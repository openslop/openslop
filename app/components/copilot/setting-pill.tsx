"use client";

import type { CSSProperties, ReactNode } from "react";
import { InfoTip } from "@/components/ui/info-tip";
import { ButtonMenuTrigger, SelectMenu } from "@/components/ui/select-menu";

export interface SettingPillOption<T extends string> {
	value: T;
	label: string;
	/** Shown behind an info icon on the menu row, for a choice the label alone cannot explain. */
	description?: string;
}

/**
 * One composer setting: a menu button showing the selected option, which opens the
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
			options={options.map((option) => ({
				value: option.value,
				label: option.description ? (
					<>
						{option.label}
						<InfoTip label={option.description} className="ml-auto pl-2" />
					</>
				) : (
					option.label
				),
			}))}
			itemClassName="rounded-lg text-label-xs"
		>
			<ButtonMenuTrigger
				icon={icon}
				aria-label={`${name}: ${selected.label}`}
				disabled={disabled}
				className={className}
				style={style}
			>
				{selected.label}
			</ButtonMenuTrigger>
		</SelectMenu>
	);
}
