"use client";

import { useState } from "react";
import { ArtStyleModal } from "../style/ArtStyleModal";
import { CharacterEditModal } from "./CharacterEditModal";
import { NarratorEditModal } from "./NarratorEditModal";
import { NewCharacterDialog } from "./NewCharacterDialog";

/**
 * Returns rendered dialogs as JSX (mirrors the `useImageUpload` → `inputElement`
 * pattern) plus imperative openers.
 */
export function useAssetEditDialogs() {
	const [creating, setCreating] = useState(false);
	const [editingName, setEditingName] = useState<string | undefined>();
	const [editingNarrator, setEditingNarrator] = useState(false);
	const [editingArtStyle, setEditingArtStyle] = useState(false);

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
			<ArtStyleModal open={editingArtStyle} onOpenChange={setEditingArtStyle} />
		</>
	);

	return {
		openCreateCharacter: () => setCreating(true),
		editCharacter: (name: string) => setEditingName(name),
		openNarrator: () => setEditingNarrator(true),
		openArtStyle: () => setEditingArtStyle(true),
		dialogs,
	};
}
