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
	const menu = useCharacterMention();
	return (
		<>
			<Editable
				{...props}
				onKeyDown={(event) => {
					menu.onKeyDown(event);
					if (!event.defaultPrevented) onKeyDown?.(event);
				}}
				aria-controls={menu.mention && menu.listboxId}
				aria-activedescendant={
					menu.mention && optionId(menu.listboxId, menu.active)
				}
			/>
			{menu.mention && (
				<CharacterMentionMenu
					mention={menu.mention}
					options={menu.options}
					active={menu.active}
					listboxId={menu.listboxId}
					onSelect={menu.select}
					onDismiss={menu.dismiss}
				/>
			)}
		</>
	);
}
