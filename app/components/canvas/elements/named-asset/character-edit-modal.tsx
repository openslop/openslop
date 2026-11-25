"use client";

import { useSlateStatic } from "slate-react";
import { ensureAsset, removeAsset } from "@/lib/canvas/asset-ops";
import { useAsset } from "@/lib/canvas/use-assets";
import type { AssetType } from "@/lib/canvas/types";
import { AppearanceEditor } from "./appearance-editor";
import { AssetDialog } from "./asset-dialog";
import { DeleteNamedAssetButton } from "../delete-asset";
import { SwitchField } from "./fields";
import { VoiceEditor } from "./voice-editor";

export function CharacterEditModal({
	name,
	onClose,
}: {
	name: string;
	onClose: () => void;
}) {
	const editor = useSlateStatic();
	const avatar = useAsset("asset_avatar", name);
	const voice = useAsset("asset_voice", name);
	const toggle = (type: AssetType) => (on: boolean) =>
		on ? ensureAsset(editor, type, name) : removeAsset(editor, type, name);

	return (
		<AssetDialog
			title={name}
			description={
				avatar
					? "Edits save automatically. Regenerate the avatar after changing the appearance."
					: "Edits save automatically."
			}
			onClose={onClose}
			actions={<DeleteNamedAssetButton name={name} onDeleted={onClose} />}
		>
			<SwitchField
				label="Avatar"
				checked={avatar !== undefined}
				disabled={!voice}
				onCheckedChange={toggle("asset_avatar")}
			/>
			{avatar && (
				<AppearanceEditor element={avatar} modelLabel="Avatar model" />
			)}
			<SwitchField
				label="Voice"
				checked={voice !== undefined}
				disabled={!avatar}
				onCheckedChange={toggle("asset_voice")}
			/>
			{voice && <VoiceEditor element={voice} />}
		</AssetDialog>
	);
}
