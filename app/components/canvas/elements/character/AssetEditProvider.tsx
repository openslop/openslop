"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { AssetType } from "@/lib/canvas/types";
import { ArtStyleModal } from "../style/ArtStyleModal";
import { CharacterEditModal } from "./CharacterEditModal";
import { AssetDialog } from "./AssetDialog";
import { VoiceEditor } from "./VoiceEditor";
import { NewCharacterDialog } from "./NewCharacterDialog";

export type AssetEditors = {
	editAsset: (type: ModalAsset, name?: string) => void;
	openCreateCharacter: () => void;
};

type DialogProps = { name?: string; onClose: () => void };

type ModalAsset = Exclude<AssetType, "title" | "project">;

const characterDialog = ({ name = "", onClose }: DialogProps) => (
	<CharacterEditModal key={name} name={name} onClose={onClose} />
);

const artStyleDialog = ({ onClose }: DialogProps) => (
	<ArtStyleModal onClose={onClose} />
);

const narratorDialog = ({ onClose }: DialogProps) => (
	<AssetDialog
		title="Narrator"
		description="Change how the narrator sounds"
		onClose={onClose}
	>
		<VoiceEditor />
	</AssetDialog>
);

/** The dialog each asset type is edited in. A character's look and voice share one. */
const ASSET_DIALOGS: Record<ModalAsset, (props: DialogProps) => ReactNode> = {
	cast: characterDialog,
	voice: (props) =>
		props.name ? characterDialog(props) : narratorDialog(props),
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
	const [editing, setEditing] = useState<AssetEdit | null>(null);
	const close = () => setEditing(null);

	const editors = useMemo<AssetEditors>(
		() => ({
			editAsset: (type, name) => setEditing({ kind: "edit", type, name }),
			openCreateCharacter: () => setEditing({ kind: "create" }),
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
