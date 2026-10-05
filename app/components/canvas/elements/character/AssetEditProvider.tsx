"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSlateStatic } from "slate-react";
import { ensureSpeaker } from "@/lib/canvas/assetOps";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { AssetType } from "@/lib/canvas/types";
import { ArtStyleModal } from "../style/ArtStyleModal";
import { CharacterEditModal } from "./CharacterEditModal";
import { NewCharacterDialog } from "./NewCharacterDialog";

export type AssetEditors = {
	editAsset: (type: ModalAsset, name?: string) => void;
	/** Opens a speaker's dialog, the narrator's when no one is named, adding them to the cast first. */
	editSpeaker: (name?: string) => void;
	openCreateCharacter: () => void;
};

type DialogProps = { name?: string; onClose: () => void };

type ModalAsset = Exclude<AssetType, "title">;

const characterDialog = ({ name = "", onClose }: DialogProps) => (
	<CharacterEditModal key={name} name={name} onClose={onClose} />
);

const artStyleDialog = ({ onClose }: DialogProps) => (
	<ArtStyleModal onClose={onClose} />
);

/** The dialog each asset type is edited in. A cast member's look and voice share one. */
const ASSET_DIALOGS: Record<ModalAsset, (props: DialogProps) => ReactNode> = {
	cast: characterDialog,
	style: artStyleDialog,
	references: artStyleDialog,
};

/** The one asset dialog open at a time, so two can never stack. */
type AssetEdit =
	| { kind: "create" }
	| { kind: "edit"; type: ModalAsset; name?: string };

const [AssetEditContext, useAssetEditors] =
	createRequiredContext<AssetEditors>("AssetEditProvider");
export { useAssetEditors };

/** Mounts the asset dialogs once, so no view wires openers down to its tiles. */
export function AssetEditProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const [editing, setEditing] = useState<AssetEdit | null>(null);
	const close = () => setEditing(null);

	const editors = useMemo<AssetEditors>(
		() => ({
			editAsset: (type, name) => setEditing({ kind: "edit", type, name }),
			editSpeaker: (name) =>
				setEditing({
					kind: "edit",
					type: "cast",
					name: ensureSpeaker(editor, name),
				}),
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
						onCreated={(name) => editors.editAsset("cast", name)}
					/>
				)}
				{editing?.kind === "edit" &&
					ASSET_DIALOGS[editing.type]({ name: editing.name, onClose: close })}
			</Dialog>
		</AssetEditContext>
	);
}
