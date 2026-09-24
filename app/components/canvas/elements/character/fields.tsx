"use client";

import { type ReactNode } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SelectMenuItem, SelectMenuTrigger } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
			<Input
				size="sm"
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
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
	className,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	className?: string;
}) {
	return (
		<label className={cn("flex flex-col gap-1", className)}>
			<FieldLabel>{label}</FieldLabel>
			<Textarea
				size="sm"
				rows={rows}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="grow resize-none"
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
				<DropdownMenuTrigger asChild>
					<SelectMenuTrigger aria-label={label} className="w-full">
						<span
							className={value ? "text-foreground" : "text-muted-foreground"}
						>
							{value ?? "—"}
						</span>
					</SelectMenuTrigger>
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
