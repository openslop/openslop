"use client";

import type { ComponentProps } from "react";
import { Editable } from "slate-react";
import { useMention } from "../hooks/use-mention";
import { MentionMenu, optionId } from "./mention-menu";

/** An editable where `@` opens the named asset menu; keys the menu leaves pass on to `onKeyDown`. */
export function MentionEditable({
	onKeyDown,
	...props
}: ComponentProps<typeof Editable>) {
	const menu = useMention();
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
				<MentionMenu
					mention={menu.mention}
					groups={menu.groups}
					active={menu.active}
					listboxId={menu.listboxId}
					onHighlight={menu.highlight}
					onSelect={menu.select}
					onDismiss={menu.dismiss}
				/>
			)}
		</>
	);
}
