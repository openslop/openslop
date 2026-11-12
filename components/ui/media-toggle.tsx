"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type { IconComponent } from "@/components/ui/icon";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** A segment is drawn as an icon, a short text glyph (e.g. "AG"), or an icon beside its text. */
export type MediaToggleOption<T extends string> = {
	value: T;
	label: string;
	disabled?: boolean;
} & ({ icon: IconComponent; text?: string } | { icon?: never; text: string });

const mediaChromePill =
	"inline-flex items-center gap-0.5 rounded-md bg-media-toggle-bg p-0.5";

// The tooltip trigger owns `data-state` on the item, so the selected look comes
// from the caller rather than from Radix's own attribute.
const segment = (active: boolean, iconOnly: boolean) =>
	cn(
		"flex h-7 items-center justify-center gap-1 rounded-sm transition-colors focus-ring unavailable:cursor-not-allowed unavailable:opacity-40",
		iconOnly ? "w-7" : "min-w-7 flex-1 basis-0 px-2",
		active
			? "bg-media-toggle-active-bg text-media-toggle-active-fg"
			: "text-media-toggle-fg hover:bg-media-toggle-hover-bg",
	);

function Segment<T extends string>({
	option: { value, label, icon: Icon, text, disabled = false },
	active,
}: {
	option: MediaToggleOption<T>;
	active: boolean;
}) {
	return (
		<SimpleTooltip label={label}>
			<ToggleGroupPrimitive.Item
				value={value}
				aria-label={label}
				disabled={disabled}
				className={segment(active, !text)}
			>
				{Icon && <Icon size={ICON_SIZES.default} />}
				{text && (
					<span className="text-label-xs font-medium leading-none">{text}</span>
				)}
			</ToggleGroupPrimitive.Item>
		</SimpleTooltip>
	);
}

/**
 * Segmented control: a pill of icon or glyph segments with tooltip labels,
 * driven by the `--media-toggle-*` tokens. Radio semantics and arrow-key
 * roving come from the underlying toggle group.
 */
export function MediaToggle<T extends string>({
	value,
	options,
	onChange,
	ariaLabel,
	className,
}: {
	value: T;
	options: MediaToggleOption<T>[];
	onChange: (value: T) => void;
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ToggleGroupPrimitive.Root
			type="single"
			aria-label={ariaLabel}
			value={value}
			// Radix clears the value when the active segment is pressed again; a
			// segmented control always keeps one selected.
			onValueChange={(next) => {
				const picked = options.find((option) => option.value === next);
				if (picked) onChange(picked.value);
			}}
			className={cn(mediaChromePill, className)}
		>
			{options.map((option) => (
				<Segment
					key={option.value}
					option={option}
					active={option.value === value}
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
				/>
			))}
		</ToggleGroupPrimitive.Root>
	);
}
