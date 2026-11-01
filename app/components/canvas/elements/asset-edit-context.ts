import { createRequiredContext } from "@/lib/components/create-required-context";
import type { AssetType } from "@/lib/canvas/types";

export type AssetEditors = {
	/** Opens the asset's dialog, adding the asset first when there is none. */
	editAsset: (type: AssetType, name?: string) => void;
	createCharacter: (name: string) => void;
	openCreateCharacter: () => void;
};

export const [AssetEditContext, useAssetEditors] =
	createRequiredContext<AssetEditors>("AssetEditProvider");
