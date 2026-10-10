"use client";

import { ChevronDown, ChevronRight } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
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
			className="flex items-center gap-1 select-none text-badge text-muted-foreground font-medium mb-2 h-5"
			contentEditable={false}
		>
			<IconButton
				ariaLabel={ariaLabel}
				size="sm"
				variant="quiet"
				className="ml-1 opacity-0 transition-opacity duration-200 group-hover/collapsible:opacity-100 focus-visible:opacity-100"
				onClick={onToggle}
			>
				<Icon size={12} />
			</IconButton>
			{label}
			{rightSlot && (
				<div className="ml-auto opacity-0 group-hover/collapsible:opacity-100 transition-opacity duration-200 p-1">
					{rightSlot}
				</div>
			)}
		</div>
	);
}
