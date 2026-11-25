"use client";

import { useSlateStatic } from "slate-react";
import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AlertCircleFilled, Plus } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { SelectMenu } from "@/components/ui/select-menu";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import type { ContentElement } from "@/lib/canvas/types";
import { useNamesOfKind } from "@/lib/canvas/use-assets";
import { useAssetEditors } from "./asset-edit-context";
import { CharacterPill } from "./character-pill";

const LABEL = "Select which character speaks";

const missingReason = (name: string | undefined) =>
	name ? `No character named ${name}` : "No character picked for this line";

function MissingCharacterIcon() {
	return (
		<span className="absolute -top-1 -right-1 flex rounded-full bg-element-card p-px">
			<AlertCircleFilled size={10} className="text-tertiary-foreground" />
		</span>
	);
}

export function CharacterSwitcher({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const names = useNamesOfKind("character");
	const { openCreateNamedAsset } = useAssetEditors();
	const currentName = element.generationAttributes?.name;
	const missing = !(currentName && names.includes(currentName));
	const tooltip = missing ? missingReason(currentName) : LABEL;

	return (
		<SelectMenu
			value={currentName ?? ""}
			onChange={(name) => mergeAttrs(editor, element.id, { name })}
			options={names.map((name) => ({ value: name, label: name }))}
			tooltip={tooltip}
			contentClassName="max-h-64"
			footer={
				<>
					{names.length > 0 && <DropdownMenuSeparator />}
					<DropdownMenuItem
						onSelect={() => openCreateNamedAsset({ kind: "character" })}
						className="py-1"
					>
						<Plus />
						New character
					</DropdownMenuItem>
				</>
			}
		>
			<button
				type="button"
				aria-label={missing ? `${tooltip}. ${LABEL}` : LABEL}
				onMouseDown={keepFocus}
				className="inline-flex cursor-pointer items-center rounded-md focus-ring"
			>
				<CharacterPill name={currentName}>
					{missing && <MissingCharacterIcon />}
				</CharacterPill>
			</button>
		</SelectMenu>
	);
}
