"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useSlateStatic } from "slate-react";
import { addNamedAsset, ensureAsset } from "@/lib/canvas/asset-ops";
import { imageAssetTypeOf } from "@/lib/canvas/assets";
import type { ProjectAssetType } from "@/lib/canvas/types";
import {
	AssetEditContext,
	type AssetEditors,
	type NewNamedAsset,
} from "../asset-edit-context";
import { ArtStyleModal } from "../style/art-style-modal";
import { CharacterEditModal } from "./character-edit-modal";
import { NewNamedAssetDialog } from "./new-named-asset-dialog";
import { ImageAssetEditModal } from "./image-asset-edit-modal";

/** The one asset dialog open at a time, so two can never stack. */
type AssetEdit =
	| { dialog: "create"; preset: NewNamedAsset }
	| { dialog: "character"; name: string }
	| { dialog: "imageAsset"; name: string }
	| { dialog: "artStyle" };

const DIALOG_OF: Record<ProjectAssetType, (name?: string) => AssetEdit> = {
	asset_avatar: (name = "") => ({ dialog: "character", name }),
	asset_voice: (name = "") => ({ dialog: "character", name }),
	asset_location: (name = "") => ({ dialog: "imageAsset", name }),
	asset_prop: (name = "") => ({ dialog: "imageAsset", name }),
	asset_style: () => ({ dialog: "artStyle" }),
	asset_references: () => ({ dialog: "artStyle" }),
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
			openCreateNamedAsset: (preset = {}) =>
				setEditing({ dialog: "create", preset }),
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
				{editing?.dialog === "create" && (
					<NewNamedAssetDialog
						preset={editing.preset}
						onCreated={(kind, name) => {
							addNamedAsset(editor, kind, name);
							editors.editAsset(imageAssetTypeOf(kind), name);
						}}
					/>
				)}
				{editing?.dialog === "character" && (
					<CharacterEditModal
						key={editing.name}
						name={editing.name}
						onClose={close}
					/>
				)}
				{editing?.dialog === "imageAsset" && (
					<ImageAssetEditModal
						key={editing.name}
						name={editing.name}
						onClose={close}
					/>
				)}
				{editing?.dialog === "artStyle" && <ArtStyleModal onClose={close} />}
			</Dialog>
		</AssetEditContext>
	);
}
