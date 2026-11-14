"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { PopoverHeader, PopoverTrigger } from "@/components/ui/popover";

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
				onMouseDown={keepFocus}
				className="max-w-[140px]"
			>
				<span className="min-w-0 truncate">{children}</span>
				<ChevronDown className="text-foreground" />
			</Button>
		</PopoverTrigger>
	);
}

/** An attribute popover's title and action, over its editor. */
export function AttributePopoverSection({
	title,
	action,
	children,
}: {
	title: string;
	action: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<>
			<PopoverHeader title={title} action={action} />
			{children}
		</>
	);
}
