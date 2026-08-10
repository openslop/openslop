"use client";

import { useId, useState } from "react";
import { Check } from "@/components/ui/icon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CHECKERBOARD =
	"repeating-conic-gradient(currentColor 0% 25%, transparent 0% 50%) 50% / 8px 8px";

function Swatch({
	color,
	className,
}: {
	color: string | null;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"block rounded-full border border-border text-muted-foreground",
				className,
			)}
			style={color ? { backgroundColor: color } : { background: CHECKERBOARD }}
		/>
	);
}

/**
 * Color picker in a popover: a palette of swatches, an optional "none" entry
 * for layers that can be switched off, and a native input for anything else.
 */
export function ColorField({
	value,
	onChange,
	swatches,
	label,
	emptyLabel,
}: {
	value: string | null;
	onChange: (value: string | null) => void;
	swatches: readonly string[];
	label: string;
	/** When set, the picker offers a "none" choice that yields `null`. */
	emptyLabel?: string;
}) {
	const [open, setOpen] = useState(false);
	const customId = useId();

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<SimpleTooltip label={label}>
				<PopoverTrigger
					aria-label={label}
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-ring"
				>
					<Swatch color={value} className="h-5 w-5" />
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent align="end" className="w-auto min-w-0 p-2">
				<div className="grid grid-cols-5 gap-1.5">
					{swatches.map((swatch) => (
						<button
							key={swatch}
							type="button"
							aria-label={swatch}
							aria-pressed={value === swatch}
							onClick={() => {
								onChange(swatch);
								setOpen(false);
							}}
							className="relative flex h-6 w-6 items-center justify-center rounded-full focus-ring"
						>
							<Swatch color={swatch} className="h-5 w-5" />
							{value === swatch && (
								<Check className="absolute h-3 w-3 text-accent" />
							)}
						</button>
					))}
				</div>
				<div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
					<label
						htmlFor={customId}
						className="text-label text-muted-foreground"
					>
						Custom
					</label>
					<input
						id={customId}
						type="color"
						value={value ?? "#ffffff"}
						onChange={(event) => onChange(event.target.value)}
						className="h-6 w-8 cursor-pointer rounded-md border border-border bg-transparent"
					/>
					{emptyLabel && (
						<button
							type="button"
							onClick={() => {
								onChange(null);
								setOpen(false);
							}}
							className="ml-auto rounded-md px-1.5 py-1 text-label text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-ring"
						>
							{emptyLabel}
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
