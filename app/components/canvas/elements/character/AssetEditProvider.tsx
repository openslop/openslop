"use client";

import { useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { ArtStyleModal } from "../style/ArtStyleModal";
import { CharacterEditModal } from "./CharacterEditModal";
import { NarratorEditModal } from "./NarratorEditModal";
import { NewCharacterDialog } from "./NewCharacterDialog";

/** Openers for the project's asset dialogs, one per asset an asset tile stands for. */
type AssetEditors = {
	openCreateCharacter: () => void;
	editCharacter: (name: string) => void;
	openNarrator: () => void;
	openArtStyle: () => void;
};

const [AssetEditContext, useAssetEditors] =
	createRequiredContext<AssetEditors>("AssetEditProvider");
export { useAssetEditors };

/**
 * Mounts the asset dialogs once so every tile beneath opens its own, rather
 * than each view wiring the same four openers down to the tiles that use them.
 */
export function AssetEditProvider({ children }: { children: ReactNode }) {
	const [creating, setCreating] = useState(false);
	const [editingName, setEditingName] = useState<string | undefined>();
	const [editingNarrator, setEditingNarrator] = useState(false);
	const [editingArtStyle, setEditingArtStyle] = useState(false);

	const editors = useMemo<AssetEditors>(
		() => ({
			openCreateCharacter: () => setCreating(true),
			editCharacter: (name) => setEditingName(name),
			openNarrator: () => setEditingNarrator(true),
			openArtStyle: () => setEditingArtStyle(true),
		}),
		[],
	);

	return (
		<AssetEditContext value={editors}>
			{children}
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
		</AssetEditContext>
	);
}
