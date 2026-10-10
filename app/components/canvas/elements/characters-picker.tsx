"use client";

import { UserPlus } from "@/components/ui/icon";
import { useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectMenuItem } from "@/components/ui/select-menu";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { toggleShownCharacter } from "@/lib/canvas/asset-ops";
import { shownCharacters } from "@/lib/canvas/character-names";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";
import { useAvatarNames, useCharacterNames } from "@/lib/canvas/use-assets";
import { HeaderIconButton } from "./header-icon-button";
import { CharacterPill } from "./character-pill";

/** Dropdown listing the project's characters with checkmarks for selected ones. */
function ProjectCharactersMenu({
	names,
	selected,
	onSelect,
}: {
	names: string[];
	selected: Set<string>;
	onSelect: (name: string) => void;
}) {
	return (
		<DropdownMenuContent align="start" className="max-h-64 min-w-32">
			{names.map((name) => (
				<SelectMenuItem
					key={name}
					selected={selected.has(name)}
					onSelect={() => onSelect(name)}
					closeOnSelect={false}
					className="text-muted-foreground"
				>
					{name}
				</SelectMenuItem>
			))}
		</DropdownMenuContent>
	);
}

/** Multi-select add picker (image elements: many characters per element). */
export function CharactersPicker({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const names = useAvatarNames();
	const disabled = names.length === 0;
	const selected = new Set(shownCharacters(element));
	const label = disabled ? "No characters in project" : "Add character";

	return (
		<DropdownMenu modal={false}>
			<SimpleTooltip label={label}>
				<DropdownMenuTrigger asChild disabled={disabled}>
					<HeaderIconButton ariaLabel={label} disabled={disabled}>
						<UserPlus className="h-3.5 w-3.5" />
					</HeaderIconButton>
				</DropdownMenuTrigger>
			</SimpleTooltip>
			<ProjectCharactersMenu
				names={names}
				selected={selected}
				onSelect={(name) => toggleShownCharacter(editor, element, name)}
			/>
		</DropdownMenu>
	);
}

/** Single-select switcher (character elements: exactly one character per element). */
export function CharacterSwitcher({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const currentName = element.generationAttributes?.name;

	if (names.length === 0) return <CharacterPill name={currentName} />;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Change character"
					title="Change character"
					onMouseDown={(e) => e.preventDefault()}
					className="inline-flex cursor-pointer items-center rounded-md focus-ring"
				>
					<CharacterPill name={currentName} />
				</button>
			</DropdownMenuTrigger>
			<ProjectCharactersMenu
				names={names}
				selected={new Set(currentName ? [currentName] : [])}
				onSelect={(name) => mergeAttrs(editor, element.id, { name })}
			/>
		</DropdownMenu>
	);
}
