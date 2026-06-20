"use client";

import { Check, UserPlus } from "@/components/ui/icon";
import { Editor } from "slate";
import { useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { getElementCharacterNames } from "@/lib/canvas/characterNames";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
import { CharacterPill } from "./CharacterPill";

function useProjectCharacterNames(): string[] {
	const { projectId } = useConfig();
	const characters = useProjectStore(projectId, (s) => s.metadata.characters);
	return Object.keys(characters);
}

function writeCharacters(
	editor: Editor,
	element: CanvasContentElement,
	names: string[],
): void {
	const joined = names.join(", ");
	updateElementAttrs(editor, element, { characters: joined || null });
}

export function toggleCharacter(
	editor: Editor,
	element: CanvasContentElement,
	name: string,
): void {
	const current = getElementCharacterNames(element);
	const next = current.includes(name)
		? current.filter((n) => n !== name)
		: [...current, name];
	writeCharacters(editor, element, next);
}

export function removeCharacter(
	editor: Editor,
	element: CanvasContentElement,
	name: string,
): void {
	writeCharacters(
		editor,
		element,
		getElementCharacterNames(element).filter((n) => n !== name),
	);
}

function setCharacterName(
	editor: Editor,
	element: CanvasContentElement,
	name: string,
): void {
	updateElementAttrs(editor, element, { name });
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
				<DropdownMenuItem
					key={name}
					onClick={() => onSelect(name)}
					onSelect={(e) => e.preventDefault()}
					className="cursor-pointer py-1 text-label text-muted-foreground"
				>
					<span className="w-3.5 shrink-0 flex items-center justify-center">
						{selected.has(name) && (
							<Check className="w-3 h-3 text-foreground" aria-hidden="true" />
						)}
					</span>
					{name}
				</DropdownMenuItem>
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
					<button
						type="button"
						aria-label={label}
						onMouseDown={(e) => e.preventDefault()}
						disabled={disabled}
						className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
					>
						<UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
					</button>
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
	const currentName = element.customAttributes?.name;

	if (names.length === 0) return <CharacterPill name={currentName} />;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Change character"
					title="Change character"
					onMouseDown={(e) => e.preventDefault()}
					className="inline-flex cursor-pointer items-center rounded-md"
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
