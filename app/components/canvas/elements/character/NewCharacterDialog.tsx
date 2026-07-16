"use client";

import { useState } from "react";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { FIELD_CLS } from "./fields";
import { useProject } from "@/lib/project/useProject";

export function NewCharacterDialog({
	open,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: (name: string) => void;
}) {
	return (
		<MountedDialog open={open} onOpenChange={onOpenChange}>
			<NewCharacterDialogBody onCreated={onCreated} />
		</MountedDialog>
	);
}

function NewCharacterDialogBody({
	onCreated,
}: {
	onCreated: (name: string) => void;
}) {
	const characters = useProject((s) => s.metadata.characters);
	const setCharacter = useProject((s) => s.setCharacter);
	const [name, setName] = useState("");

	const normalized = normalizeCharacterName(name);
	const collision = !!normalized && !!characters[normalized];
	const canSubmit = !!normalized && !collision;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		setCharacter(normalized, { appearance: "" });
		onCreated(normalized);
	};

	return (
		<DialogContent className="max-w-sm">
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<DialogHeader>
					<DialogTitle>New character</DialogTitle>
					<DialogDescription>
						Pick a name. You can fill in the details next.
					</DialogDescription>
				</DialogHeader>

				<input
					type="text"
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Character name"
					aria-label="Character name"
					className={FIELD_CLS}
				/>

				{collision && (
					<span className="text-label-xs text-rose-400" role="alert">
						A character named &quot;{normalized}&quot; already exists.
					</span>
				)}

				<DialogFooter>
					<button
						type="submit"
						disabled={!canSubmit}
						className="rounded-md border border-border bg-muted px-3 py-1 text-label font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted"
					>
						Create
					</button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
