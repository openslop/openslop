"use client";

import { type ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectMenuItem } from "@/components/ui/select-menu";

export const FIELD_CLS =
	"w-full rounded-md border border-border bg-card px-2 py-1.5 font-body text-label text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50";

export function FieldLabel({ children }: { children: ReactNode }) {
	return (
		<span className="text-label-xs uppercase tracking-wide text-muted-foreground">
			{children}
		</span>
	);
}

export function TextField({
	label,
	value,
	onChange,
	placeholder,
}: {
	label: string;
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
}) {
	return (
		<label className="flex flex-col gap-1">
			<FieldLabel>{label}</FieldLabel>
			<input
				type="text"
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={FIELD_CLS}
			/>
		</label>
	);
}

export function TextAreaField({
	label,
	value,
	onChange,
	placeholder,
	rows = 4,
	className = "",
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	className?: string;
}) {
	return (
		<label className={`flex flex-col gap-1 ${className}`}>
			<FieldLabel>{label}</FieldLabel>
			<textarea
				rows={rows}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={`${FIELD_CLS} grow resize-none`}
			/>
		</label>
	);
}

export function EnumField<T extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly T[];
	value: T | undefined;
	onChange: (value: T | undefined) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel>{label}</FieldLabel>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					aria-label={label}
					className={`${FIELD_CLS} flex items-center justify-between text-left`}
				>
					<span className={value ? "text-foreground" : "text-muted-foreground"}>
						{value ?? "—"}
					</span>
					<ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="max-h-64 min-w-[var(--radix-dropdown-menu-trigger-width)]"
				>
					<SelectMenuItem
						selected={value === undefined}
						onSelect={() => onChange(undefined)}
						className="text-muted-foreground"
					>
						—
					</SelectMenuItem>
					{options.map((option) => (
						<SelectMenuItem
							key={option}
							selected={option === value}
							onSelect={() => onChange(option)}
							className="text-muted-foreground"
						>
							{option}
						</SelectMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
