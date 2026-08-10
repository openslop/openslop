"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "@/components/ui/icon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
	CAPTION_FONTS,
	CAPTION_FONT_LABELS,
	CAPTION_FONT_STACKS,
	type CaptionFont,
} from "@/lib/video/captionStyle";

/** Full-width font picker; each row is set in the face it selects. */
export function CaptionFontField({
	value,
	onChange,
}: {
	value: CaptionFont;
	onChange: (value: CaptionFont) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const matches = CAPTION_FONTS.filter((font) =>
		CAPTION_FONT_LABELS[font]
			.toLowerCase()
			.includes(query.trim().toLowerCase()),
	);

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				setQuery("");
			}}
		>
			<SimpleTooltip label="Font">
				<PopoverTrigger
					aria-label="Caption font"
					className="flex h-8 w-full items-center justify-between gap-2 rounded-md bg-input px-3 text-body text-foreground transition-colors hover:bg-surface-hover focus-ring"
				>
					<span style={{ fontFamily: CAPTION_FONT_STACKS[value] }}>
						{CAPTION_FONT_LABELS[value]}
					</span>
					<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
				</PopoverTrigger>
			</SimpleTooltip>
			<PopoverContent
				align="start"
				// Match the trigger so the list reads as one full-width control.
				className="w-[var(--radix-popover-trigger-width)] min-w-0 p-1"
			>
				<div className="flex items-center gap-2 rounded-md bg-input px-2 focus-within:ring-2 focus-within:ring-ring">
					<Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
					<input
						autoFocus
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search…"
						aria-label="Search fonts"
						className="h-8 w-full bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
					/>
				</div>
				<ul className="mt-1 max-h-56 overflow-y-auto">
					{matches.map((font) => (
						<li key={font}>
							<button
								type="button"
								onClick={() => {
									onChange(font);
									setOpen(false);
								}}
								aria-pressed={font === value}
								className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-body text-foreground transition-colors hover:bg-surface-hover focus-ring"
							>
								<span style={{ fontFamily: CAPTION_FONT_STACKS[font] }}>
									{CAPTION_FONT_LABELS[font]}
								</span>
								{font === value && (
									<Check className="h-3.5 w-3.5 shrink-0 text-accent" />
								)}
							</button>
						</li>
					))}
					{matches.length === 0 && (
						<li className="px-2 py-1.5 text-label text-muted-foreground">
							No fonts match “{query}”
						</li>
					)}
				</ul>
			</PopoverContent>
		</Popover>
	);
}
