"use client";

import { Button } from "@/components/ui/button";
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
			<Button
				type="button"
				variant="secondary"
				size="xs"
				aria-label={tooltip}
				title={tooltip}
				onMouseDown={(e) => e.preventDefault()}
				className="max-w-[140px]"
			>
				<span className="min-w-0 truncate">{children}</span>
				<ChevronDown className="h-3 w-3 shrink-0 text-foreground" />
			</Button>
		</PopoverTrigger>
	);
}
