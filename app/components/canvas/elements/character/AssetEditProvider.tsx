"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { ArtStyleModal } from "../style/ArtStyleModal";
import { CharacterEditModal } from "./CharacterEditModal";
import { NarratorEditModal } from "./NarratorEditModal";
import { NewCharacterDialog } from "./NewCharacterDialog";

/** Openers for the project's asset dialogs, one per asset an asset tile stands for. */
export type AssetEditors = {
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
	const close = () => setEditing(null);

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
			<Dialog
				open={editing !== null}
				onOpenChange={(open) => {
					if (!open) close();
				}}
			>
				{editing?.kind === "create" && (
					<NewCharacterDialog onCreated={editors.editCharacter} />
				)}
				{editing?.kind === "character" && (
					<CharacterEditModal
						key={editing.name}
						name={editing.name}
						onClose={close}
					/>
				)}
				{editing?.kind === "narrator" && <NarratorEditModal onClose={close} />}
				{editing?.kind === "style" && <ArtStyleModal onClose={close} />}
			</Dialog>
		</AssetEditContext>
	);
}
