"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSlateStatic } from "slate-react";
import { ensureAsset } from "@/lib/canvas/assetOps";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { AssetType } from "@/lib/canvas/types";
import { ArtStyleModal } from "../style/ArtStyleModal";
import { CharacterEditModal } from "./CharacterEditModal";
import { NewCharacterDialog } from "./NewCharacterDialog";

export type AssetEditors = {
	/** Opens the asset's dialog, adding the asset first when there is none. */
	editAsset: (type: ModalAsset, name?: string) => void;
	openCreateCharacter: () => void;
};

type DialogProps = { name?: string; onClose: () => void };

type ModalAsset = Exclude<AssetType, "asset_title">;

const characterDialog = ({ name = "", onClose }: DialogProps) => (
	<CharacterEditModal key={name} name={name} onClose={onClose} />
);

const artStyleDialog = ({ onClose }: DialogProps) => (
	<ArtStyleModal onClose={onClose} />
);

/** The dialog each asset type is edited in. A character's look and voice share one. */
const ASSET_DIALOGS: Record<ModalAsset, (props: DialogProps) => ReactNode> = {
	asset_character: characterDialog,
	asset_style: artStyleDialog,
	asset_references: artStyleDialog,
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
			editAsset: (type, name) => {
				ensureAsset(editor, type, name);
				setEditing({ kind: "edit", type, name });
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
						onCreated={(name) => editors.editAsset("asset_character", name)}
					/>
				)}
				{editing?.kind === "edit" &&
					ASSET_DIALOGS[editing.type]({ name: editing.name, onClose: close })}
			</Dialog>
		</AssetEditContext>
	);
}
