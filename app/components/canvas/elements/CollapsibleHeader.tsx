"use client";

import { ChevronDown, ChevronRight } from "@/components/ui/icon";
import type { ReactNode } from "react";

export function CollapsibleHeader({
	label,
	collapsed,
	onToggle,
	ariaLabel,
	rightSlot,
}: {
	label: ReactNode;
	collapsed: boolean;
	onToggle: () => void;
	ariaLabel: string;
	rightSlot?: ReactNode;
}) {
	const Icon = collapsed ? ChevronRight : ChevronDown;
	return (
		<div
			className="flex items-center gap-1 select-none text-[10px] text-muted-foreground font-medium mb-2 h-5"
			contentEditable={false}
		>
			<button
				type="button"
				onClick={onToggle}
				className="opacity-0 group-hover/collapsible:opacity-100 transition-opacity duration-200 p-0.5 -ml-1 rounded hover:bg-muted"
				aria-label={ariaLabel}
			>
				<Icon size={12} />
			</button>
			{label}
			{rightSlot && (
				<div className="ml-auto opacity-0 group-hover/collapsible:opacity-100 transition-opacity duration-200 p-1">
					{rightSlot}
				</div>
			)}
		</div>
	);
}
