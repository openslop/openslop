"use client";

import { useRef, useState } from "react";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import { CloseButton } from "@/components/ui/close-button";
import { Eyedropper } from "@/components/ui/icon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./color-field.css";

// Chrome-only today, so it isn't in lib.dom yet.
declare global {
	interface Window {
		EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
	}
}

const CHECKERBOARD =
	"repeating-conic-gradient(currentColor 0% 25%, transparent 0% 50%) 50% / 8px 8px";

/** Opacity lives in the trailing pair of an 8-digit hex. */
const OPAQUE = "ff";

const alphaPercent = (color: string) => {
	const pair = color.length === 9 ? color.slice(7) : OPAQUE;
	return Math.round((Number.parseInt(pair, 16) / 255) * 100);
};

const withAlphaPercent = (color: string, percent: number) => {
	const clamped = Math.min(100, Math.max(0, percent));
	const pair = Math.round((clamped / 100) * 255)
		.toString(16)
		.padStart(2, "0");
	return `${color.slice(0, 7)}${pair}`;
};

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

/** Picks a color from the screen where the browser supports it. */
function EyedropperButton({
	onPick,
	onPickingChange,
}: {
	onPick: (color: string) => void;
	onPickingChange: (picking: boolean) => void;
}) {
	const [supported] = useState(
		() => typeof window !== "undefined" && Boolean(window.EyeDropper),
	);
	if (!supported) return null;

	return (
		<SimpleTooltip label="Pick a color from the screen">
			<button
				type="button"
				aria-label="Pick a color from the screen"
				onClick={async () => {
					const eyeDropper = window.EyeDropper;
					if (!eyeDropper) return;
					onPickingChange(true);
					try {
						onPick((await new eyeDropper().open()).sRGBHex);
					} catch {
						// The picker was dismissed; leave the color as it was.
					} finally {
						onPickingChange(false);
					}
				}}
				className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-ring"
			>
				<Eyedropper className="h-4 w-4" />
			</button>
		</SimpleTooltip>
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
	const picking = useRef(false);
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
		<Popover
			open={open}
			// Picking from the screen reads as an outside click, which would
			// otherwise tear the picker down mid-pick.
			onOpenChange={(next) => {
				if (!next && picking.current) return;
				setOpen(next);
			}}
		>
			<SimpleTooltip label={label}>
				<PopoverTrigger
					aria-label={label}
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-ring"
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
					<EyedropperButton
						onPick={setExternal}
						onPickingChange={(next) => {
							picking.current = next;
						}}
					/>
					<HexColorInput
						color={color}
						onChange={setExternal}
						prefixed
						alpha
						aria-label={`${label} hex`}
						className="h-7 w-full min-w-0 rounded-md bg-input px-2 font-mono text-label-xs text-foreground uppercase outline-none focus-ring"
					/>
					<label className="flex h-7 shrink-0 items-center rounded-md bg-input pr-1 pl-2">
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
									"flex h-6 w-6 items-center justify-center rounded-full focus-ring",
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
								"flex h-6 w-6 items-center justify-center rounded-full focus-ring",
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
