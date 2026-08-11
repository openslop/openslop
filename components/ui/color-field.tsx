"use client";

import { useState } from "react";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import { CloseButton } from "@/components/ui/close-button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { alphaPercent, withAlphaPercent } from "@/lib/color/hexAlpha";
import { cn } from "@/lib/utils";
import "./color-field.css";

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
 * Color picker in a popover: a saturation field with hue and opacity sliders,
 * hex entry, and the palette. Layers that can be switched off also offer a
 * "none" swatch, which yields `null`.
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
	const color = value ?? "#ffffff";

	// The picker caches its own HSVA and re-syncs only when it judges the
	// incoming color different, comparing parsed rgba rather than the string.
	// Remounting on changes it did not originate keeps its pointers in step.
	const [syncKey, setSyncKey] = useState(0);
	const setExternal = (next: string | null) => {
		setSyncKey((key) => key + 1);
		onChange(next);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<SimpleTooltip label={label}>
				<PopoverTrigger
					aria-label={label}
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-media-toggle-hover-bg focus-ring"
				>
					<Swatch color={value} className="h-5 w-5" />
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent align="end" className="w-60 p-3">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-label font-semibold text-foreground">{label}</h3>
					<CloseButton onClick={() => setOpen(false)} />
				</div>

				<HexAlphaColorPicker key={syncKey} color={color} onChange={onChange} />

				<div className="mt-3 flex items-center gap-2">
					<HexColorInput
						color={color}
						onChange={setExternal}
						prefixed
						alpha
						aria-label={`${label} hex`}
						className="h-7 w-full min-w-0 rounded-md bg-input px-2 font-mono text-label-xs text-foreground uppercase outline-none focus-ring"
					/>
					<label className="flex h-7 shrink-0 items-center rounded-md bg-input pr-1 pl-2 focus-within:ring-2 focus-within:ring-ring">
						<span className="sr-only">{label} opacity</span>
						<input
							type="number"
							min={0}
							max={100}
							value={alphaPercent(color)}
							onChange={(event) =>
								setExternal(withAlphaPercent(color, event.target.valueAsNumber))
							}
							className="w-9 bg-transparent text-right font-mono text-label-xs text-foreground tabular-nums outline-none"
						/>
						<span className="text-label-xs text-muted-foreground">%</span>
					</label>
				</div>

				<div className="mt-3 grid grid-cols-7 gap-1.5 border-t border-border pt-3">
					{emptyLabel && (
						<SimpleTooltip label={emptyLabel}>
							<button
								type="button"
								aria-label={emptyLabel}
								aria-pressed={value === null}
								onClick={() => {
									setExternal(null);
									setOpen(false);
								}}
								className={cn(
									"flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-hover focus-ring",
									value === null && "ring-2 ring-accent",
								)}
							>
								<Swatch color={null} className="h-5 w-5" />
							</button>
						</SimpleTooltip>
					)}
					{swatches.map((swatch) => (
						<button
							key={swatch}
							type="button"
							aria-label={swatch}
							aria-pressed={value === swatch}
							onClick={() => setExternal(swatch)}
							className={cn(
								"flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-surface-hover focus-ring",
								value === swatch && "ring-2 ring-accent",
							)}
						>
							<Swatch color={swatch} className="h-5 w-5" />
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
