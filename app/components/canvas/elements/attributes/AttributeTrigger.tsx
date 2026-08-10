"use client";

import { ChevronDown } from "@/components/ui/icon";
import { PopoverTrigger } from "@/components/ui/popover";

/** The pill that opens an attribute's editor. */
export function AttributeTrigger({
	tooltip,
	children,
}: {
	tooltip: string;
	children: React.ReactNode;
}) {
	return (
		<PopoverTrigger asChild>
			<button
				type="button"
				aria-label={tooltip}
				title={tooltip}
				onMouseDown={(e) => e.preventDefault()}
				className="bg-secondary text-secondary-foreground text-label px-2 py-1 rounded-md max-w-[140px] inline-flex items-center gap-1.5 cursor-pointer ring-1 ring-inset ring-border hover:bg-button-hover hover:text-foreground transition-colors"
			>
				<span className="truncate min-w-0">{children}</span>
				<ChevronDown className="w-3 h-3 shrink-0 text-foreground" />
			</button>
		</PopoverTrigger>
	);
}
