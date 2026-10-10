"use client";

import { useId, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SelectMenuItem, SelectMenuTrigger } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { mergeAttrs } from "@/lib/canvas/editorOps";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import type { CanvasElement } from "@/lib/canvas/types";
import type { AttributeSpec } from "@/lib/connectors/attributes/schema";
import { cn } from "@/lib/utils";
import { useWriteThrough } from "@/app/components/canvas/hooks/useWriteThrough";

export function FieldLabel({ children }: { children: ReactNode }) {
	return (
		<span className="text-label-xs uppercase tracking-wide text-muted-foreground">
			{children}
		</span>
	);
}

export function TextAreaField({
	label,
	aside,
	value,
	onChange,
	placeholder,
	rows = 4,
	autoFocus,
	className,
}: {
	label: string;
	aside?: ReactNode;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	autoFocus?: boolean;
	className?: string;
}) {
	const id = useId();
	const [draft, setDraft] = useWriteThrough(value, onChange);
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<div className="flex min-h-6 items-center justify-between gap-2">
				<label htmlFor={id}>
					<FieldLabel>{label}</FieldLabel>
				</label>
				{aside}
			</div>
			<Textarea
				id={id}
				size="sm"
				rows={rows}
				autoFocus={autoFocus}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				placeholder={placeholder}
				className="grow resize-none"
			/>
		</div>
	);
}

export function SwitchField({
	label,
	checked,
	disabled,
	onCheckedChange,
}: {
	label: string;
	checked: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	const id = useId();
	return (
		<div className="flex min-h-6 items-center gap-2">
			<label htmlFor={id} className="flex">
				<FieldLabel>{label}</FieldLabel>
			</label>
			<Switch
				id={id}
				checked={checked}
				disabled={disabled}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	);
}

function TextField({
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
	const [draft, setDraft] = useWriteThrough(value ?? "", onChange);
	return (
		<label className="flex flex-col gap-1">
			<FieldLabel>{label}</FieldLabel>
			<Input
				size="sm"
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				placeholder={placeholder}
			/>
		</label>
	);
}

function EnumField({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly string[];
	value: string | undefined;
	onChange: (value: string | undefined) => void;
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
					{[undefined, ...options].map((option) => (
						<SelectMenuItem
							key={option ?? ""}
							selected={option === value}
							onSelect={() => onChange(option)}
							className="text-muted-foreground"
						>
							{option ?? "—"}
						</SelectMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

/** Text and enum attributes as labelled form fields, two to a row. */
export function AttributeFields({
	element,
	specs,
}: {
	element: CanvasElement;
	specs: Record<string, AttributeSpec>;
}) {
	const editor = useSlateStatic();
	const attrs = flatAttributes(element);

	return (
		<div className="grid grid-cols-2 content-start gap-2">
			{Object.entries(specs).map(([key, { label, edit }]) => {
				const set = (next: string | undefined) =>
					mergeAttrs(editor, element.id, { [key]: next });
				return edit?.kind === "enum" ? (
					<EnumField
						key={key}
						label={label}
						options={edit.options}
						value={attrs[key]}
						onChange={set}
					/>
				) : (
					<TextField
						key={key}
						label={label}
						value={attrs[key]}
						onChange={set}
						placeholder={edit?.kind === "text" ? edit.placeholder : undefined}
					/>
				);
			})}
		</div>
	);
}
