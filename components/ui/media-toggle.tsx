"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type { IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** A segment is drawn either as an icon or as a short text glyph (e.g. "AG"). */
export type MediaToggleOption<T extends string> = {
	value: T;
	label: string;
	disabled?: boolean;
} & ({ icon: IconComponent; text?: never } | { icon?: never; text: string });

const mediaChromePill =
	"inline-flex items-center gap-0.5 rounded-md bg-media-toggle-bg p-0.5";

/** `field` sits level with a small form field beside it. */
const SEGMENT_SIZES = { default: "h-6 min-w-6", field: "h-7 min-w-7" } as const;

type ToggleSize = keyof typeof SEGMENT_SIZES;

// The tooltip trigger owns `data-state` on the item, so the selected look comes
// from the caller rather than from Radix's own attribute.
const segment = (active: boolean, size: ToggleSize) =>
	cn(
		"flex flex-1 basis-0 items-center justify-center rounded-sm px-1 transition-colors focus-ring unavailable:cursor-not-allowed unavailable:opacity-40",
		SEGMENT_SIZES[size],
		active
			? "bg-media-toggle-active-bg text-media-toggle-active-fg"
			: "text-media-toggle-fg hover:bg-media-toggle-hover-bg",
	);

function Segment<T extends string>({
	option: { value, label, icon: Icon, text, disabled = false },
	active,
	size,
}: {
	option: MediaToggleOption<T>;
	active: boolean;
	size: ToggleSize;
}) {
	return (
		<SimpleTooltip label={label}>
			<ToggleGroupPrimitive.Item
				value={value}
				aria-label={label}
				disabled={disabled}
				className={segment(active, size)}
			>
				{Icon ? (
					<Icon className="h-3.5 w-3.5" />
				) : (
					<span className="text-label-xs font-medium leading-none">{text}</span>
				)}
			</ToggleGroupPrimitive.Item>
		</SimpleTooltip>
	);
}

/**
 * Compact segmented control: a pill of equal-width icon or glyph segments with
 * tooltip labels, driven by the `--media-toggle-*` tokens. Radio semantics and
 * arrow-key roving come from the underlying toggle group.
 */
export function MediaToggle<T extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	size = "default",
	className,
}: {
	value: T;
	options: MediaToggleOption<T>[];
	onChange: (value: T) => void;
	ariaLabel?: string;
	size?: ToggleSize;
	className?: string;
}) {
	return (
		<ToggleGroupPrimitive.Root
			type="single"
			aria-label={ariaLabel}
			value={value}
			// Radix clears the value when the active segment is pressed again; a
			// segmented control always keeps one selected.
			onValueChange={(next) => next && onChange(next as T)}
			className={cn(mediaChromePill, className)}
		>
			{options.map((option) => (
				<Segment
					key={option.value}
					option={option}
					active={option.value === value}
					size={size}
				/>
			))}
		</ToggleGroupPrimitive.Root>
	);
}

/**
 * The {@link MediaToggle} pill for independent on/off options, each toggling
 * its own flag rather than selecting one of a set.
 */
export function MediaToggleFlags<T extends string>({
	values,
	options,
	onToggle,
	className,
}: {
	values: Record<T, boolean>;
	options: MediaToggleOption<T>[];
	onToggle: (value: T, next: boolean) => void;
	className?: string;
}) {
	const active = options
		.filter(({ value }) => values[value])
		.map(({ value }) => value);

	return (
		<ToggleGroupPrimitive.Root
			type="multiple"
			value={active}
			onValueChange={(next) => {
				for (const { value } of options) {
					const on = next.includes(value);
					if (on !== values[value]) onToggle(value, on);
				}
			}}
			className={cn(mediaChromePill, className)}
		>
			{options.map((option) => (
				<Segment
					key={option.value}
					option={option}
					active={values[option.value]}
					size="default"
				/>
			))}
		</ToggleGroupPrimitive.Root>
	);
}
