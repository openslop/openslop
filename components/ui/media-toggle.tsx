"use client";

import type { LucideIcon } from "@/components/ui/icon";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface MediaToggleOption<T extends string> {
	value: T;
	label: string;
	icon: LucideIcon;
}

/**
 * Compact icon segmented control: a pill of icon buttons with tooltip labels,
 * driven by the `--media-toggle-*` tokens. Shared by the animated-image preview
 * and the editor side panel.
 */
export function MediaToggle<T extends string>({
	value,
	options,
	onChange,
	className,
}: {
	value: T;
	options: MediaToggleOption<T>[];
	onChange: (value: T) => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-0.5 rounded-full bg-media-toggle-bg p-0.5",
				className,
			)}
		>
			{options.map(({ value: optValue, label, icon: Icon }) => {
				const active = optValue === value;
				return (
					<Tooltip key={optValue}>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={() => onChange(optValue)}
								aria-label={label}
								aria-pressed={active}
								className={cn(
									"flex h-6 w-6 items-center justify-center rounded-full transition-colors",
									active
										? "bg-media-toggle-active-bg text-media-toggle-active-fg"
										: "text-media-toggle-fg hover:opacity-70",
								)}
							>
								<Icon className="h-3.5 w-3.5" />
							</button>
						</TooltipTrigger>
						<TooltipContent>{label}</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
}
