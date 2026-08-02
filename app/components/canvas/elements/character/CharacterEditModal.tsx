"use client";

import { useState } from "react";
import { Trash2 } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { CloseButton } from "@/components/ui/close-button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { deleteCharacter } from "@/lib/project/deleteCharacter";
import { useProject } from "@/lib/project/useProject";
import type { MetadataCharacter } from "@/lib/project/types";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import { GenerateButton, StaleIndicator } from "../GenerateButton";
import { MediaPlaceholder, MediaPreview } from "../preview/results";
import { TextAreaField } from "./fields";
import { StaleAvatarCloseDialog } from "./StaleAvatarCloseDialog";
import { useAvatarGeneration } from "./useAvatarGeneration";
import { VoiceSection } from "./VoiceMetadataFields";

export function CharacterEditModal({
	open,
	onOpenChange,
	name,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	name?: string;
}) {
	return (
		<MountedDialog open={open && !!name} onOpenChange={onOpenChange}>
			{name && (
				<CharacterEditDialogBody
					key={name}
					name={name}
					onClose={() => onOpenChange(false)}
				/>
			)}
		</MountedDialog>
	);
}

function CharacterEditDialogBody({
	name,
	onClose,
}: {
	name: string;
	onClose: () => void;
}) {
	const { projectId } = useConfig();
	const queue = useGenerationQueue();
	const character = useProject((s) => s.metadata.characters[name]);
	const updateCharacter = useProject((s) => s.updateCharacter);
	const avatar = useAvatarGeneration(name);

	const [confirmDelete, setConfirmDelete] = useState(false);
	const [closeConfirm, setCloseConfirm] = useState(false);

	if (!character) return null;

	const update = (partial: Partial<MetadataCharacter>) =>
		updateCharacter(name, partial);

	const requestClose = () => (avatar.stale ? setCloseConfirm(true) : onClose());

	const interceptClose = (e: { preventDefault(): void }) => {
		if (avatar.stale && !closeConfirm) {
			e.preventDefault();
			setCloseConfirm(true);
		}
	};

	const handleDelete = () => {
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		deleteCharacter(projectId, queue, name);
		onClose();
	};

	return (
		<DialogContent
			className="max-w-2xl"
			showCloseButton={false}
			onEscapeKeyDown={interceptClose}
			onInteractOutside={interceptClose}
		>
			<CloseButton
				onClick={requestClose}
				className="absolute right-3 top-3 z-10"
			/>
			<DialogHeader className="shrink-0">
				<DialogTitle>{name}</DialogTitle>
				<DialogDescription>
					Edits save automatically. Regenerate the avatar after changing the
					appearance.
				</DialogDescription>
			</DialogHeader>

			<div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-2">
						<TextAreaField
							className="min-h-0 flex-1"
							label="Appearance"
							value={character.appearance}
							onChange={(appearance) => update({ appearance })}
							placeholder="Describe the character's look"
						/>
						<div className="flex items-center justify-end gap-2">
							{avatar.stale && avatar.generatedAppearance != null && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										update({ appearance: String(avatar.generatedAppearance) })
									}
								>
									Revert
								</Button>
							)}
							{avatar.stale && <StaleIndicator />}
							<GenerateButton
								status={avatar.status}
								hasResult={Boolean(avatar.url)}
								disabled={avatar.generating || !character.appearance.trim()}
								onGenerate={avatar.regenerate}
							/>
						</div>
					</div>
					<div className="relative">
						{avatar.url ? (
							<MediaPreview
								key={avatar.url}
								url={avatar.url}
								outputKind="image"
								status={avatar.status}
								seconds={avatar.seconds}
								error={avatar.error}
							/>
						) : (
							<MediaPlaceholder
								status={avatar.status}
								seconds={avatar.seconds}
								error={avatar.error}
								onDiscard={avatar.discard}
							/>
						)}
						<UploadImageButton
							className="absolute left-2 top-2 z-10 bg-card shadow-sm ring-1 ring-border"
							onUpload={avatar.commitUpload}
						/>
					</div>
				</div>
				<VoiceSection voice={character} onChange={update} />
			</div>

			<DialogFooter className="shrink-0">
				<Button
					type="button"
					variant={confirmDelete ? "destructive" : "outline"}
					size="sm"
					onClick={handleDelete}
					className={
						confirmDelete ? "sm:mr-auto" : "text-muted-foreground sm:mr-auto"
					}
				>
					<Trash2 />
					{confirmDelete ? "Confirm delete" : "Delete"}
				</Button>
				<Button type="button" size="sm" onClick={requestClose}>
					Done
				</Button>
			</DialogFooter>

			<StaleAvatarCloseDialog
				open={closeConfirm}
				onOpenChange={setCloseConfirm}
				characterName={name}
				onLeaveStale={onClose}
				onRegenerate={() => {
					avatar.regenerate();
					onClose();
				}}
			/>
		</DialogContent>
	);
}
