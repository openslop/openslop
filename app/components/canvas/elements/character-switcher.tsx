"use client";

import { useSlateStatic } from "slate-react";
import { SelectMenu } from "@/components/ui/select-menu";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";
import { useCharacterNames } from "@/lib/canvas/use-assets";
import { CharacterPill } from "./character-pill";

export function CharacterSwitcher({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const currentName = element.generationAttributes?.name;

	if (names.length === 0) return <CharacterPill name={currentName} />;

	return (
		<SelectMenu
			value={currentName ?? ""}
			onChange={(name) => mergeAttrs(editor, element.id, { name })}
			options={names.map((name) => ({ value: name, label: name }))}
			contentClassName="max-h-64"
			itemClassName="text-muted-foreground"
		>
			<button
				type="button"
				aria-label="Change character"
				title="Change character"
				onMouseDown={(e) => e.preventDefault()}
				className="inline-flex cursor-pointer items-center rounded-md focus-ring"
			>
				<CharacterPill name={currentName} />
			</button>
		</SelectMenu>
	);
}
