"use client";

import type { ReactNode } from "react";
import type { IconComponent } from "@/components/ui/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SimpleTooltip } from "@/components/ui/tooltip";

export interface SelectFieldOption<T extends string> {
	value: T;
	label: ReactNode;
	Icon?: IconComponent;
	disabled?: boolean;
}

/**
 * Form field for picking a value: renders its own labelled trigger, with
 * listbox semantics. Use in panel rows and dialogs.
 *
 * For a picker hung off a trigger you supply yourself (a badge, a toolbar
 * button), use `SelectMenu` — it takes `children` as the trigger and has menu
 * semantics.
 */
export function SelectField<T extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	tooltip,
	unavailable = false,
}: {
	value: T;
	options: readonly SelectFieldOption<T>[];
	onChange: (value: T) => void;
	ariaLabel: string;
	tooltip?: string;
	/** Shown but never opened, and still hoverable so a tooltip can explain why. */
	unavailable?: boolean;
}) {
	const trigger = (
		<SelectTrigger
			size="sm"
			aria-label={ariaLabel}
			aria-disabled={unavailable || undefined}
		>
			<SelectValue />
		</SelectTrigger>
	);
	return (
		<Select
			value={value}
			onValueChange={(next) => onChange(next as T)}
			open={unavailable ? false : undefined}
		>
			{tooltip == null ? (
				trigger
			) : (
				<SimpleTooltip label={tooltip}>{trigger}</SimpleTooltip>
			)}
			<SelectContent>
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						disabled={option.disabled}
						className="text-label"
					>
						{option.Icon ? (
							<span className="flex items-center gap-1.5">
								<option.Icon size={12} />
								{option.label}
							</span>
						) : (
							option.label
						)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
