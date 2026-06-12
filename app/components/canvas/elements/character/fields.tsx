"use client";

import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	GlassDropdownContent,
	GlassDropdownItem,
} from "@/app/components/GlassDropdown";

export const FIELD_CLS =
	"w-full rounded-md border border-glass-border bg-glass-fill px-2 py-1.5 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent-violet/50";

export function FieldLabel({ children }: { children: ReactNode }) {
	return (
		<span className="text-[11px] uppercase tracking-wide text-white/50">
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
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
}) {
	return (
		<label className="flex flex-col gap-1">
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

const ENUM_OPTION_CLS = "gap-1.5 rounded-md text-[12px]";

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
					<span className={value ? "text-white" : "text-white/30"}>
						{value ?? "—"}
					</span>
					<ChevronDown className="h-3 w-3 shrink-0 text-white/60" />
				</DropdownMenuTrigger>
				<GlassDropdownContent
					align="start"
					className="max-h-64 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto shadow-black/40"
				>
					<GlassDropdownItem
						selected={value === undefined}
						onSelect={() => onChange(undefined)}
						className={ENUM_OPTION_CLS}
					>
						<span className="text-white/50">—</span>
					</GlassDropdownItem>
					{options.map((option) => (
						<GlassDropdownItem
							key={option}
							selected={option === value}
							onSelect={() => onChange(option)}
							className={ENUM_OPTION_CLS}
						>
							{option}
						</GlassDropdownItem>
					))}
				</GlassDropdownContent>
			</DropdownMenu>
		</div>
	);
}
