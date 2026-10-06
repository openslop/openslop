"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useSlateStatic } from "slate-react";
import { setAsset } from "@/lib/canvas/assetOps";
import { useCharacterNames } from "@/lib/canvas/useAssets";
import { normalizeCharacterName } from "@/lib/project/characterName";

export function NewCharacterDialog({
	onCreated,
}: {
	onCreated: (name: string) => void;
}) {
	const editor = useSlateStatic();
	const names = useCharacterNames();
	const [name, setName] = useState("");

	const normalized = normalizeCharacterName(name);
	const collision = names.includes(normalized);
	const canSubmit = !!normalized && !collision;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		setAsset(editor, "asset_character", normalized);
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

				<Input
					size="sm"
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Character name"
					aria-label="Character name"
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
