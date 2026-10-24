"use client";

import { useMemo } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { keepFocus } from "@/components/ui/keep-focus";
import type { Mention } from "@/lib/canvas/character-refs";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./character-pill";

export const optionId = (listboxId: string, index: number) =>
	`${listboxId}-${index}`;

function CharacterOption({
	id,
	name,
	active,
	onSelect,
}: {
	id: string;
	name: string;
	active: boolean;
	onSelect: () => void;
}) {
	return (
		<div
			id={id}
			role="option"
			aria-selected={active}
			onPointerDown={keepFocus}
			onClick={onSelect}
			className={cn(
				"flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-label",
				active && "bg-surface-hover",
			)}
		>
			<CharacterAvatar name={name} />
			<span className="min-w-0 truncate">{name}</span>
		</div>
	);
}

export function CharacterMentionMenu({
	mention,
	options,
	active,
	listboxId,
	onSelect,
	onDismiss,
}: {
	mention: Mention;
	options: string[];
	active: number;
	listboxId: string;
	onSelect: (name: string) => void;
	onDismiss: () => void;
}) {
	const editor = useSlateStatic();
	const caret = useMemo(
		() => ({
			current: {
				getBoundingClientRect: () =>
					ReactEditor.toDOMRange(editor, mention.range).getBoundingClientRect(),
			},
		}),
		[editor, mention],
	);

	return (
		<Popover open onOpenChange={(open) => open || onDismiss()}>
			<PopoverAnchor virtualRef={caret} />
			<PopoverContent
				align="start"
				className="max-h-64 w-48 overflow-y-auto p-1 font-body"
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
			>
				<div id={listboxId} role="listbox" aria-label="Characters">
					{options.map((name, index) => (
						<CharacterOption
							key={name}
							id={optionId(listboxId, index)}
							name={name}
							active={index === active}
							onSelect={() => onSelect(name)}
						/>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
