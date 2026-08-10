"use client";

import { useCallback, useRef, useState } from "react";
import { useSlateStatic } from "slate-react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import { AttributeTrigger } from "./AttributeTrigger";

interface TextAttributePopoverProps {
	element: CanvasContentElement;
	attrKey: string;
	value: string;
	label: string;
	tooltip: string;
	placeholder?: string;
	rows?: number;
	hideLabel?: boolean;
}

export function TextAttributePopover({
	element,
	attrKey,
	value,
	label,
	tooltip,
	placeholder,
	rows = 3,
	hideLabel = false,
}: TextAttributePopoverProps) {
	const editor = useSlateStatic();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value);
	const cancelRef = useRef(false);

	const commit = useCallback(
		(next: string) => {
			if (next === value) return;
			updateElementAttrs(editor, element, { [attrKey]: next });
		},
		[editor, element, attrKey, value],
	);

	const handleOpenChange = (next: boolean) => {
		if (next) {
			setDraft(value);
		} else if (cancelRef.current) {
			setDraft(value);
		} else {
			commit(draft);
		}
		cancelRef.current = false;
		setOpen(next);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<AttributeTrigger tooltip={tooltip}>
				{!hideLabel && (
					<span className={value ? "opacity-70 mr-1" : "opacity-90"}>
						{label}
					</span>
				)}
				{value ? value : <span className="opacity-50">— add</span>}
			</AttributeTrigger>
			<PopoverContent
				align="start"
				sideOffset={4}
				onEscapeKeyDown={() => {
					cancelRef.current = true;
				}}
				className="w-72 p-1.5"
			>
				<textarea
					autoFocus
					rows={rows}
					value={draft}
					aria-label={label}
					placeholder={placeholder}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							commit(draft);
							setOpen(false);
						}
					}}
					className="w-full resize-none rounded-lg border border-border bg-card px-2 py-1.5 font-body text-label text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
				/>
				<div className="mt-1 px-1 text-badge text-muted-foreground">
					⌘↵ to save · esc to cancel
				</div>
			</PopoverContent>
		</Popover>
	);
}
