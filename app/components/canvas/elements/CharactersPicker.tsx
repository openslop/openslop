"use client";

import { Check, UserPlus } from "lucide-react";
import { Editor } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { getElementCharacterNames } from "../utils/characters";
import { setNodeAttrs } from "../utils/editorOps";
import { CharacterPill } from "./CharacterBadge";

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
	const path = ReactEditor.findPath(editor, element);
	const joined = names.join(", ");
	setNodeAttrs(editor, path, element, { characters: joined || null });
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
	const path = ReactEditor.findPath(editor, element);
	setNodeAttrs(editor, path, element, { name });
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
		<DropdownMenuContent
			align="start"
			className="min-w-32 max-h-64 overflow-y-auto rounded-xl border border-glass-border bg-glass-fill backdrop-blur-xl shadow-md shadow-black/8 p-0.5"
		>
			{names.map((name) => (
				<DropdownMenuItem
					key={name}
					onClick={() => onSelect(name)}
					onSelect={(e) => e.preventDefault()}
					className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
				>
					<span className="w-3.5 shrink-0 flex items-center justify-center">
						{selected.has(name) && (
							<Check className="w-3 h-3 text-white" aria-hidden="true" />
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

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild disabled={disabled}>
				<button
					aria-label={disabled ? "No characters in project" : "Add character"}
					title={disabled ? "No characters in project" : "Add character"}
					onMouseDown={(e) => e.preventDefault()}
					disabled={disabled}
					className="bg-cyan-500 text-white text-[12px] px-2 py-1 rounded-full inline-flex items-center gap-1 cursor-pointer ring-1 ring-inset ring-white/20 hover:ring-white/50 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<UserPlus className="w-3 h-3" />
					<span>Character</span>
				</button>
			</DropdownMenuTrigger>
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
					className="inline-flex items-center cursor-pointer rounded-full hover:ring-1 hover:ring-white/30 transition-shadow"
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
