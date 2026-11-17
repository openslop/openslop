import { createRequiredContext } from "@/lib/components/create-required-context";
import type { ProjectAssetType } from "@/lib/canvas/types";

type CharacterAssetType = Extract<
	ProjectAssetType,
	"asset_avatar" | "asset_voice"
>;

/** The edit openers add the asset first when there is none. */
export type AssetEditors = {
	editCharacter: (type: CharacterAssetType, name: string) => void;
	editAsset: (type: Exclude<ProjectAssetType, CharacterAssetType>) => void;
	createCharacter: (name: string) => void;
	openCreateCharacter: () => void;
};

export const [AssetEditContext, useAssetEditors] =
	createRequiredContext<AssetEditors>("AssetEditProvider");
