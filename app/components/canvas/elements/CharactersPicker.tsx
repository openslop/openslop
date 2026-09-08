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
import { getElementCharacterNames } from "@/lib/canvas/characterNames";
import {
	setCharacterName,
	toggleCharacter,
} from "@/app/components/canvas/utils/characterOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useProject } from "@/lib/project/useProject";
import { useShallow } from "zustand/react/shallow";
import { HeaderIconButton } from "./HeaderIconButton";
import { CharacterPill } from "./CharacterPill";

function useProjectCharacterNames(): string[] {
	return useProject(useShallow((s) => Object.keys(s.metadata.characters)));
}

/** Dropdown listing the project's characters with checkmarks for selected ones. */
function ProjectCharactersMenu({
	selected,
	onSelect,
}: {
	selected: Set<string>;
	onSelect: (name: string) => void;
}) {
	const names = useProjectCharacterNames();
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
export function CharactersPicker({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	const names = useProjectCharacterNames();
	const disabled = names.length === 0;
	const selected = new Set(getElementCharacterNames(element));
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
				selected={selected}
				onSelect={(name) => toggleCharacter(editor, element, name)}
			/>
		</DropdownMenu>
	);
}

/** Single-select switcher (character elements: exactly one character per element). */
export function CharacterSwitcher({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	const names = useProjectCharacterNames();
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
				selected={new Set(currentName ? [currentName] : [])}
				onSelect={(name) => setCharacterName(editor, element, name)}
			/>
		</DropdownMenu>
	);
}
