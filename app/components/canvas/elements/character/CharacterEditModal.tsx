"use client";

import { useSlateStatic } from "slate-react";
import { Trash2 } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ensureAsset, removeAsset } from "@/lib/canvas/assetOps";
import { elementModelPick } from "@/lib/canvas/elementConnector";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { useAsset } from "@/lib/canvas/useAssets";
import { updateElementText } from "@/lib/canvas/editorOps";
import type { AssetType } from "@/lib/canvas/types";
import { ModelAttribute } from "../attributes/ModelAttribute";
import { ElementGenerationProvider } from "../ElementGenerationContext";
import {
	ElementGenerateButton,
	ElementStaleIndicator,
} from "../GenerateButton";
import { ElementHistoryButton } from "../ElementHistoryButton";
import { ElementUploadButton } from "../ElementUploadButton";
import { OutputPreview } from "../OutputPreview";
import { AssetDialog } from "./AssetDialog";
import { deleteCharacter } from "./deleteCharacter";
import { SwitchField, TextAreaField } from "./fields";
import { VoiceEditor } from "./VoiceEditor";

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
			actions={
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						deleteCharacter(editor, name);
						onClose();
					}}
					className="text-muted-foreground sm:mr-auto"
				>
					<Trash2 />
					Delete
				</Button>
			}
		>
			<SwitchField
				label="Avatar"
				checked={avatar !== undefined}
				disabled={!voice}
				onCheckedChange={toggle("asset_avatar")}
			/>
			{avatar && (
				<ElementGenerationProvider element={avatar}>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex min-w-0 flex-col gap-2">
							<TextAreaField
								className="min-h-0 flex-1"
								label="Appearance"
								autoFocus
								aside={
									<div className="flex items-center gap-1">
										<ModelAttribute
											element={avatar}
											pick={elementModelPick(avatar)}
											label="Avatar model"
										/>
										<ElementHistoryButton element={avatar} />
									</div>
								}
								value={getElementBodyText(avatar)}
								onChange={(text) => updateElementText(editor, avatar.id, text)}
								placeholder="Describe the character's look"
							/>
							<div className="flex items-center justify-end gap-2">
								<ElementStaleIndicator />
								<ElementGenerateButton />
							</div>
						</div>
						<div className="relative">
							<OutputPreview outputKind="image" />
							<ElementUploadButton className="absolute left-2 top-2 z-10 bg-card shadow-sm ring-1 ring-border" />
						</div>
					</div>
				</ElementGenerationProvider>
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
