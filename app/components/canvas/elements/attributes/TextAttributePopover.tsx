"use client";

import { ChevronDown } from "@/components/ui/icon";
import { useCallback, useRef, useState } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { setNodeAttrs } from "@/lib/canvas/editorOps";

interface TextAttributePopoverProps {
	element: CanvasContentElement;
	attrKey: string;
	value: string;
	label: string;
	color: string;
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
	color,
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
			const path = ReactEditor.findPath(editor, element);
			setNodeAttrs(editor, path, element, { [attrKey]: next });
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
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={tooltip}
					title={tooltip}
					className={`${color} text-foreground text-[12px] px-2 py-1 rounded-md max-w-[140px] inline-flex items-center gap-1.5 cursor-pointer ring-1 ring-inset ring-border hover:ring-border hover:brightness-110 transition-all`}
				>
					<span className="truncate min-w-0">
						{!hideLabel && (
							<span className={value ? "opacity-70 mr-1" : "opacity-90"}>
								{label}
							</span>
						)}
						{value ? value : <span className="opacity-50">— add</span>}
					</span>
					<ChevronDown className="w-3 h-3 shrink-0 text-foreground" />
				</button>
			</PopoverTrigger>
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
					className="w-full resize-none rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
				/>
				<div className="mt-1 px-1 text-[10px] text-muted-foreground">
					⌘↵ to save · esc to cancel
				</div>
			</PopoverContent>
		</Popover>
	);
}
