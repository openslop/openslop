"use client";

import { useSlateStatic } from "slate-react";
import { AlertCircleFilled } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { SelectMenu } from "@/components/ui/select-menu";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";
import { useCharacterNames } from "@/lib/canvas/use-assets";
import { CharacterPill } from "./character-pill";

const LABEL = "Select which character speaks";
const MISSING_LABEL = "Character missing";

function MissingCharacterIcon() {
	return (
		<span className="absolute -top-1 -right-1 flex rounded-full bg-element-card p-px">
			<AlertCircleFilled
				size={10}
				className="text-tertiary-foreground"
				role="img"
				aria-hidden={false}
				aria-label={MISSING_LABEL}
			/>
		</span>
	);
}

export function CharacterSwitcher({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const currentName = element.generationAttributes?.name;
	const missing = !(currentName && names.includes(currentName));
	const pill = (
		<CharacterPill name={currentName}>
			{missing && <MissingCharacterIcon />}
		</CharacterPill>
	);

	if (names.length === 0) return pill;

	return (
		<SelectMenu
			value={currentName ?? ""}
			onChange={(name) => mergeAttrs(editor, element.id, { name })}
			options={names.map((name) => ({ value: name, label: name }))}
			tooltip={LABEL}
			contentClassName="max-h-64"
			itemClassName="text-muted-foreground"
		>
			<button
				type="button"
				aria-label={missing ? `${MISSING_LABEL}. ${LABEL}` : LABEL}
				onMouseDown={keepFocus}
				className="inline-flex cursor-pointer items-center rounded-md focus-ring"
			>
				{pill}
			</button>
		</SelectMenu>
	);
}
