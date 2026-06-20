"use client";

import { type ReactNode } from "react";
import { Check, ChevronDown } from "@/components/ui/icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
					className="max-h-64 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-xl border border-border bg-card p-0.5 shadow-md shadow-black/40"
				>
					<EnumOption
						selected={value === undefined}
						onSelect={() => onChange(undefined)}
					>
						<span className="text-muted-foreground">—</span>
					</EnumOption>
					{options.map((option) => (
						<EnumOption
							key={option}
							selected={option === value}
							onSelect={() => onChange(option)}
						>
							{option}
						</EnumOption>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

function EnumOption({
	selected,
	onSelect,
	children,
}: {
	selected: boolean;
	onSelect: () => void;
	children: ReactNode;
}) {
	return (
		<DropdownMenuItem
			onClick={onSelect}
			className="flex cursor-pointer items-center gap-1.5 py-1 text-label text-muted-foreground"
		>
			<span className="flex w-3.5 shrink-0 items-center justify-center">
				{selected && <Check className="h-3 w-3 text-foreground" aria-hidden />}
			</span>
			{children}
		</DropdownMenuItem>
	);
}
