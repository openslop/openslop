"use client";

import { Fragment, useMemo } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { keepFocus } from "@/components/ui/keep-focus";
import { SectionTitle } from "@/components/ui/section-title";
import { Separator } from "@/components/ui/separator";
import { ASSET_KIND_SPECS } from "@/lib/canvas/assets";
import type { Mention, MentionGroup } from "@/lib/canvas/character-refs";
import { cn } from "@/lib/utils";
import { AssetAvatar } from "./asset-avatar";

export const optionId = (listboxId: string, index: number) =>
	`${listboxId}-${index}`;

function MentionOption({
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
			<AssetAvatar name={name} />
			<span className="min-w-0 truncate">{name}</span>
		</div>
	);
}

/** The assets `@` can name, under a heading per kind. */
export function MentionMenu({
	mention,
	groups,
	active,
	listboxId,
	onSelect,
	onDismiss,
}: {
	mention: Mention;
	groups: MentionGroup[];
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
				<div id={listboxId} role="listbox" aria-label="Assets">
					{groups.map(({ kind, names, start }) => {
						const headingId = `${listboxId}-${kind}`;
						return (
							<Fragment key={kind}>
								{start > 0 && <Separator className="my-1" />}
								<div role="group" aria-labelledby={headingId}>
									<SectionTitle id={headingId} className="px-2 py-1.5">
										{ASSET_KIND_SPECS[kind].plural}
									</SectionTitle>
									{names.map((name, i) => (
										<MentionOption
											key={name}
											id={optionId(listboxId, start + i)}
											name={name}
											active={start + i === active}
											onSelect={() => onSelect(name)}
										/>
									))}
								</div>
							</Fragment>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
