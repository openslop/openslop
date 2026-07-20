"use client";

import type { ReactNode } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface SelectFieldOption<T extends string> {
	value: T;
	label: ReactNode;
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
}: {
	value: T;
	options: readonly SelectFieldOption<T>[];
	onChange: (value: T) => void;
	ariaLabel: string;
}) {
	return (
		<Select value={value} onValueChange={(next) => onChange(next as T)}>
			<SelectTrigger size="sm" aria-label={ariaLabel}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						disabled={option.disabled}
						className="text-label"
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
