"use client";

import { useState } from "react";
import { useSlateStatic } from "slate-react";
import { Trash2 } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { removeAsset } from "@/lib/canvas/assetOps";
import { hasAvatar } from "@/lib/canvas/assets";
import { elementModelPick } from "@/lib/canvas/elementConnector";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { useAsset } from "@/lib/canvas/useAssets";
import { updateNodeText } from "@/lib/canvas/editorOps";
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
import { TextAreaField } from "./fields";
import { VoiceEditor } from "./VoiceEditor";

export function CharacterEditModal({
	name,
	onClose,
}: {
	name: string;
	onClose: () => void;
}) {
	const editor = useSlateStatic();
	const cast = useAsset("cast", name);
	const [confirmDelete, setConfirmDelete] = useState(false);

	if (!cast) return null;

	return (
		<AssetDialog
			title={name}
			description={
				hasAvatar(cast)
					? "Edits save automatically. Regenerate the avatar after changing the appearance."
					: "Edits save automatically."
			}
			onClose={onClose}
			actions={
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setConfirmDelete(true)}
					className="text-muted-foreground sm:mr-auto"
				>
					<Trash2 />
					Delete
				</Button>
			}
		>
			{hasAvatar(cast) && (
				<ElementGenerationProvider element={cast}>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex min-w-0 flex-col gap-2">
							<TextAreaField
								className="min-h-0 flex-1"
								label="Appearance"
								aside={
									<div className="flex items-center gap-1">
										<ModelAttribute
											element={cast}
											pick={elementModelPick(cast)}
											label="Avatar model"
										/>
										<ElementHistoryButton element={cast} />
									</div>
								}
								value={getElementBodyText(cast)}
								onChange={(text) => updateNodeText(editor, cast.id, text)}
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
			<VoiceEditor cast={cast} />

			<ConfirmDeleteDialog
				target={confirmDelete ? name : undefined}
				onClose={() => setConfirmDelete(false)}
				title={(target) => `Delete ${target}?`}
				description="This removes the character and their avatar. Undo from the canvas to bring them back."
				actionLabel="Delete character"
				onConfirm={() => {
					removeAsset(editor, "cast", name);
					onClose();
				}}
			/>
		</AssetDialog>
	);
}
