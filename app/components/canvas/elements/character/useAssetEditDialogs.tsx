"use client";

import { useState } from "react";
import { CharacterEditModal } from "./CharacterEditModal";
import { NarratorEditModal } from "./NarratorEditModal";
import { NewCharacterDialog } from "./NewCharacterDialog";

/**
 * Owns the create-character / edit-character / edit-narrator dialog flow shared
 * by the editor's assets panel and the composer. Returns imperative openers plus
 * the rendered dialogs (mirrors the `useImageUpload` → `inputElement` pattern).
 */
export function useAssetEditDialogs() {
	const [creating, setCreating] = useState(false);
	const [editingName, setEditingName] = useState<string | undefined>();
	const [editingNarrator, setEditingNarrator] = useState(false);

	const dialogs = (
		<>
			<NewCharacterDialog
				open={creating}
				onOpenChange={setCreating}
				onCreated={(name) => {
					setCreating(false);
					setEditingName(name);
				}}
			/>
			<CharacterEditModal
				open={editingName !== undefined}
				onOpenChange={(open) => !open && setEditingName(undefined)}
				name={editingName}
			/>
			<NarratorEditModal
				open={editingNarrator}
				onOpenChange={setEditingNarrator}
			/>
		</>
	);

	return {
		openCreateCharacter: () => setCreating(true),
		editCharacter: setEditingName,
		openNarrator: () => setEditingNarrator(true),
		dialogs,
	};
}
