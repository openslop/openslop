"use client";

import type { ComponentProps } from "react";
import { Editable } from "slate-react";
import { useCharacterMention } from "../hooks/use-character-mention";
import { CharacterMentionMenu, optionId } from "./character-mention-menu";

/** An editable where `@` opens the character menu; keys the menu leaves pass on to `onKeyDown`. */
export function MentionEditable({
	onKeyDown,
	...props
}: ComponentProps<typeof Editable>) {
	const mention = useCharacterMention();
	const open = mention.mention;
	return (
		<>
			<Editable
				{...props}
				onKeyDown={(event) => {
					mention.onKeyDown(event);
					if (!event.defaultPrevented) onKeyDown?.(event);
				}}
				aria-controls={open && mention.listboxId}
				aria-activedescendant={
					open && optionId(mention.listboxId, mention.active)
				}
			/>
			{open && (
				<CharacterMentionMenu
					mention={open}
					options={mention.options}
					active={mention.active}
					listboxId={mention.listboxId}
					onSelect={mention.select}
					onDismiss={mention.dismiss}
				/>
			)}
		</>
	);
}
