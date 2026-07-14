"use client";

import type { ReactNode } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface PanelSelectOption<T extends string> {
	value: T;
	label: ReactNode;
	disabled?: boolean;
}

/**
 * Options-driven `Select` for panel rows. Generic over the option union so the
 * selected value round-trips as `T` instead of a bare `string` the caller has
 * to cast back.
 */
export function PanelSelect<T extends string>({
	value,
	options,
	onChange,
	ariaLabel,
}: {
	value: T;
	options: readonly PanelSelectOption<T>[];
	onChange: (value: T) => void;
	ariaLabel: string;
}) {
	return (
		<Select
			value={value}
			onValueChange={(next) => {
				const selected = options.find((option) => option.value === next);
				if (selected) onChange(selected.value);
			}}
		>
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
