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

/** The one asset dialog open at a time, so two can never stack. */
type AssetEdit =
	| { kind: "create" }
	| { kind: "character"; name: string }
	| { kind: "narrator" }
	| { kind: "style" };

const [AssetEditContext, useAssetEditors] =
	createRequiredContext<AssetEditors>("AssetEditProvider");
export { useAssetEditors };

/**
 * Mounts the asset dialogs once so every tile beneath opens its own, rather
 * than each view wiring the same four openers down to the tiles that use them.
 */
export function AssetEditProvider({ children }: { children: ReactNode }) {
	const [editing, setEditing] = useState<AssetEdit | null>(null);
	const onOpenChange = (open: boolean) => {
		if (!open) setEditing(null);
	};
	const character = editing?.kind === "character" ? editing : undefined;

	const editors = useMemo<AssetEditors>(
		() => ({
			openCreateCharacter: () => setEditing({ kind: "create" }),
			editCharacter: (name) => setEditing({ kind: "character", name }),
			openNarrator: () => setEditing({ kind: "narrator" }),
			openArtStyle: () => setEditing({ kind: "style" }),
		}),
		[],
	);

	return (
		<AssetEditContext value={editors}>
			{children}
			<NewCharacterDialog
				open={editing?.kind === "create"}
				onOpenChange={onOpenChange}
				onCreated={editors.editCharacter}
			/>
			<CharacterEditModal
				open={character !== undefined}
				onOpenChange={onOpenChange}
				name={character?.name}
			/>
			<NarratorEditModal
				open={editing?.kind === "narrator"}
				onOpenChange={onOpenChange}
			/>
			<ArtStyleModal
				open={editing?.kind === "style"}
				onOpenChange={onOpenChange}
			/>
		</AssetEditContext>
	);
}
