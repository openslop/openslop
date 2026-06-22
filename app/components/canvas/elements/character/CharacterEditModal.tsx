"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useConfig } from "@/lib/config/ConfigProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { isStaleResult } from "@/lib/generation/queue";
import {
	buildCharacterAvatarJob,
	characterAvatarElement,
	characterAvatarElementId,
} from "@/lib/project/ensureCharacterAvatars";
import { useProjectStore } from "@/lib/project/store";
import type { MetadataCharacter } from "@/lib/project/types";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { GenerateButton, StaleIndicator } from "../GenerateButton";
import { MediaPlaceholder, MediaPreview } from "../preview/results";
import { TextAreaField } from "./fields";
import { StaleAvatarCloseDialog } from "./StaleAvatarCloseDialog";
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
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();
	const metadata = useProjectStore(projectId, (s) => s.metadata);
	const character = metadata.characters[name];
	const setCharacter = useProjectStore(projectId, (s) => s.setCharacter);
	const removeCharacter = useProjectStore(projectId, (s) => s.removeCharacter);

	const [confirmDelete, setConfirmDelete] = useState(false);
	const [closeConfirm, setCloseConfirm] = useState(false);

	const avatarElementId = characterAvatarElementId(name);
	const avatarSnapshot = useQueueSelector((q) =>
		q.getElementSnapshot(avatarElementId),
	);

	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => {
			if (!url) return;
			queue.discard(avatarElementId);
			setCharacter(name, {
				...character,
				avatarUrl: url,
				avatarUploaded: true,
			});
		},
	});

	if (!character) return null;

	const update = (partial: Partial<MetadataCharacter>) =>
		setCharacter(name, { ...character, ...partial });

	const regenerateAvatar = () => {
		if (character.avatarUploaded) {
			setCharacter(name, { ...character, avatarUploaded: false });
		}
		queue.enqueue(buildCharacterAvatarJob(projectId, name, connectorConfig));
	};

	const isStale =
		!character.avatarUploaded &&
		isStaleResult(
			avatarSnapshot,
			getGenerationInputs(
				characterAvatarElement(name, character.appearance),
				metadata,
			),
		);

	const generating = avatarSnapshot.status !== "idle";
	const hasAppearance = Boolean(character.appearance?.trim());
	const generateDisabled = generating || !hasAppearance;
	const revertAppearance = avatarSnapshot.resultInputs?.attributes.appearance;

	const requestClose = () => (isStale ? setCloseConfirm(true) : onClose());

	const interceptClose = (e: { preventDefault(): void }) => {
		if (isStale && !closeConfirm) {
			e.preventDefault();
			setCloseConfirm(true);
		}
	};

	const handleDelete = () => {
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		queue.discard(avatarElementId);
		removeCharacter(name);
		onClose();
	};

	return (
		<DialogContent
			className="max-w-2xl"
			showCloseButton={false}
			onEscapeKeyDown={interceptClose}
			onInteractOutside={interceptClose}
		>
			<button
				type="button"
				onClick={requestClose}
				aria-label="Close"
				className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
			>
				<X className="h-4 w-4" />
			</button>
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
							{isStale && revertAppearance != null && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										update({ appearance: String(revertAppearance) })
									}
								>
									Revert
								</Button>
							)}
							{isStale && <StaleIndicator />}
							<GenerateButton
								status={avatarSnapshot.status}
								hasResult={Boolean(character.avatarUrl)}
								disabled={generateDisabled}
								onGenerate={regenerateAvatar}
							/>
						</div>
					</div>
					<div className="relative">
						{character.avatarUrl ? (
							<MediaPreview
								key={character.avatarUrl}
								url={character.avatarUrl}
								outputKind="image"
								status={avatarSnapshot.status}
								seconds={avatarSnapshot.seconds}
							/>
						) : (
							<MediaPlaceholder
								status={avatarSnapshot.status}
								seconds={avatarSnapshot.seconds}
								error={avatarSnapshot.error}
								onDiscard={() => queue.discard(avatarElementId)}
							/>
						)}
						{inputElement}
						<SimpleTooltip label="Upload image">
							<IconButton
								ariaLabel="Upload image"
								onClick={openPicker}
								disabled={uploading}
								className="absolute left-2 top-2 z-10 rounded-full bg-card shadow-sm ring-1 ring-border"
							>
								{uploading ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<ImagePlus className="h-3.5 w-3.5" />
								)}
							</IconButton>
						</SimpleTooltip>
					</div>
				</div>
				<VoiceSection voice={character} onChange={update} />
			</div>

			<DialogFooter className="shrink-0">
				<button
					type="button"
					onClick={handleDelete}
					className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-label transition-colors ${
						confirmDelete
							? "border-rose-500/60 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
							: "border-border bg-card text-muted-foreground hover:bg-muted"
					}`}
				>
					<Trash2 className="h-3 w-3" />
					{confirmDelete ? "Confirm delete" : "Delete"}
				</button>
			</DialogFooter>

			<StaleAvatarCloseDialog
				open={closeConfirm}
				onOpenChange={setCloseConfirm}
				characterName={name}
				onLeaveStale={onClose}
				onRegenerate={() => {
					regenerateAvatar();
					onClose();
				}}
			/>
		</DialogContent>
	);
}
