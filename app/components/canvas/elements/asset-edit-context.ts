import { createRequiredContext } from "@/lib/components/create-required-context";
import type { AssetKind } from "@/lib/canvas/assets";
import type { ProjectAssetType } from "@/lib/canvas/types";

export type NewAsset = { kind?: AssetKind; name?: string };

export type AssetEditors = {
	/** Opens the asset's dialog, adding the asset first when there is none. */
	editAsset: (type: ProjectAssetType, name?: string) => void;
	openCreateAsset: (preset?: NewAsset) => void;
};

export const [AssetEditContext, useAssetEditors] =
	createRequiredContext<AssetEditors>("AssetEditProvider");
