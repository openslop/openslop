"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSlateStatic } from "slate-react";
import { addCharacter, ensureAsset } from "@/lib/canvas/asset-ops";
import type { AssetType } from "@/lib/canvas/types";
import { AssetEditContext, type AssetEditors } from "../asset-edit-context";
import { ArtStyleModal } from "../style/art-style-modal";
import { CharacterEditModal } from "./character-edit-modal";
import { NewCharacterDialog } from "./new-character-dialog";

/** The one asset dialog open at a time, so two can never stack. */
type AssetEdit =
	| { kind: "create" }
	| { kind: "character"; name: string }
	| { kind: "artStyle" };

const DIALOG_OF: Record<AssetType, (name?: string) => AssetEdit> = {
	asset_avatar: (name = "") => ({ kind: "character", name }),
	asset_voice: (name = "") => ({ kind: "character", name }),
	asset_style: () => ({ kind: "artStyle" }),
	asset_references: () => ({ kind: "artStyle" }),
};

/** Mounts the asset dialogs once, so no view wires openers down to its tiles. */
export function AssetEditProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const [editing, setEditing] = useState<AssetEdit | null>(null);
	const close = () => setEditing(null);

	const editors = useMemo<AssetEditors>(
		() => ({
			editAsset: (type, name) => {
				ensureAsset(editor, type, name);
				setEditing(DIALOG_OF[type](name));
			},
			createCharacter: (name) => {
				addCharacter(editor, name);
				setEditing({ kind: "character", name });
			},
			openCreateCharacter: () => setEditing({ kind: "create" }),
		}),
		[editor],
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
					<NewCharacterDialog
						onCreated={editors.createCharacter}
					/>
				)}
				{editing?.kind === "character" && (
					<CharacterEditModal
						key={editing.name}
						name={editing.name}
						onClose={close}
					/>
				)}
				{editing?.kind === "artStyle" && <ArtStyleModal onClose={close} />}
			</Dialog>
		</AssetEditContext>
	);
}
