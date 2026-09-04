"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
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
	const defaultModels = useResolveDefaultModels();
	const [name, setName] = useState("");

	const normalized = normalizeCharacterName(name);
	const collision = !!normalized && !!characters[normalized];
	const canSubmit = !!normalized && !collision;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		setCharacter(normalized, {
			appearance: "",
			avatarModel: defaultModels().image,
		});
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
					<span className="text-label-xs text-destructive" role="alert">
						A character named &quot;{normalized}&quot; already exists.
					</span>
				)}

				<DialogFooter>
					<Button
						type="submit"
						variant="secondary"
						size="sm"
						disabled={!canSubmit}
					>
						Create
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
