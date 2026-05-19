"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import type { CanvasContentElement } from "../../types";
import { setNodeAttrs } from "../../utils/editorOps";

interface TextAttributePopoverProps {
	element: CanvasContentElement;
	attrKey: string;
	value: string;
	label: string;
	color: string;
	tooltip: string;
	placeholder?: string;
	rows?: number;
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
}: TextAttributePopoverProps) {
	const editor = useSlateStatic();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);

	const openPopover = () => {
		setDraft(value);
		setOpen(true);
	};

	const commit = useCallback(
		(next: string) => {
			if (next === value) return;
			const path = ReactEditor.findPath(editor, element);
			setNodeAttrs(editor, path, element, { [attrKey]: next });
		},
		[editor, element, attrKey, value],
	);

	useEffect(() => {
		if (!open) return;
		const handlePointer = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				commit(draft);
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handlePointer);
		return () => document.removeEventListener("mousedown", handlePointer);
	}, [open, draft, commit]);

	return (
		<div ref={containerRef} className="relative inline-block">
			<button
				type="button"
				aria-label={tooltip}
				title={tooltip}
				onClick={() => {
					if (open) {
						commit(draft);
						setOpen(false);
					} else {
						openPopover();
					}
				}}
				className={`${color} text-white text-[12px] px-2 py-1 rounded-full max-w-[140px] inline-flex items-center gap-1.5 cursor-pointer ring-1 ring-inset ring-white/20 hover:ring-white/50 hover:brightness-110 transition-all`}
			>
				<span className="truncate min-w-0">
					<span className={value ? "opacity-70 mr-1" : "opacity-90"}>
						{label}
					</span>
					{value ? value : <span className="opacity-50 ml-1">— add</span>}
				</span>
				<ChevronDown className="w-3 h-3 shrink-0 text-white/80" />
			</button>
			{open && (
				<div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-1.5">
					<textarea
						autoFocus
						rows={rows}
						value={draft}
						placeholder={placeholder}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setDraft(value);
								setOpen(false);
							} else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								commit(draft);
								setOpen(false);
							}
						}}
						className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
					/>
					<div className="mt-1 px-1 text-[10px] text-white/40">
						⌘↵ to save · esc to cancel
					</div>
				</div>
			)}
		</div>
	);
}
