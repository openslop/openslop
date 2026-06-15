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
import { useConfig } from "@/lib/config/ConfigProvider";
import { normalizeCharacterName } from "@/lib/project/characterName";
import { useProjectStore } from "@/lib/project/store";

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
	const { projectId } = useConfig();
	const characters = useProjectStore(projectId, (s) => s.metadata.characters);
	const setCharacter = useProjectStore(projectId, (s) => s.setCharacter);
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
					className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
				/>

				{collision && (
					<span className="text-[11px] text-rose-400" role="alert">
						A character named &quot;{normalized}&quot; already exists.
					</span>
				)}

				<DialogFooter>
					<button
						type="submit"
						disabled={!canSubmit}
						className="rounded-md border border-border bg-muted px-3 py-1 text-[12px] font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted"
					>
						Create
					</button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
