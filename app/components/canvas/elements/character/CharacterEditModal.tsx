"use client";

import { useCallback, useMemo, useState } from "react";
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
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { isNodeStale } from "@/lib/generation/graph";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { forCharacterAvatar } from "@/lib/connectors/image/plugins/characterAvatarNode";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import {
	characterAvatarElementId,
	characterFromAvatarInputs,
} from "@/lib/project/characterAvatar";
import { deleteCharacter } from "@/lib/project/deleteCharacter";
import { useProject } from "@/lib/project/useProject";
import type { ElementVersion } from "@/lib/generation/versions";
import type { MetadataCharacter } from "@/lib/project/types";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import { GenerateButton, StaleIndicator } from "../GenerateButton";
import { MediaResult } from "../preview/results";
import { VersionHistoryPopover } from "../VersionHistoryPopover";
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
	const store = useProjectStoreHandle();
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();
	const character = useProject((s) => s.metadata.characters[name]);
	const updateCharacter = useProject((s) => s.updateCharacter);

	const [confirmDelete, setConfirmDelete] = useState(false);
	const [closeConfirm, setCloseConfirm] = useState(false);

	const avatarElementId = characterAvatarElementId(name);
	const avatarSnapshot = useQueueSelector((q) =>
		q.getElementSnapshot(avatarElementId),
	);
	const avatarUrl = avatarSnapshot.result?.imageUrl;
	const avatarNode = useMemo(
		() => buildNode(forCharacterAvatar(name)),
		[buildNode, name],
	);
	const restoreAppearance = useCallback(
		(version: ElementVersion) =>
			updateCharacter(name, characterFromAvatarInputs(version)),
		[updateCharacter, name],
	);

	if (!character) return null;

	const update = (partial: Partial<MetadataCharacter>) =>
		updateCharacter(name, partial);

	const regenerateAvatar = () => {
		if (character.avatarUploaded) update({ avatarUploaded: false });
		queue.enqueueGraph([avatarNode]);
	};

	const isStale = isNodeStale(avatarNode, queue);

	const generating = isGenerationActive(avatarSnapshot.status);
	const hasAppearance = Boolean(character.appearance?.trim());
	const generateDisabled = generating || !hasAppearance;

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
		deleteCharacter(store, queue, name);
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
							<VersionHistoryPopover
								elementId={avatarElementId}
								onRestore={restoreAppearance}
							/>
							{isStale && <StaleIndicator />}
							<GenerateButton
								status={avatarSnapshot.status}
								hasResult={Boolean(avatarUrl)}
								disabled={generateDisabled}
								onGenerate={regenerateAvatar}
							/>
						</div>
					</div>
					<div className="relative">
						<MediaResult
							url={avatarUrl}
							outputKind="image"
							status={avatarSnapshot.status}
							seconds={avatarSnapshot.seconds}
							error={avatarSnapshot.error}
							onDiscard={() => queue.discard(avatarElementId)}
						/>
						<UploadImageButton
							className="absolute left-2 top-2 z-10 bg-card shadow-sm ring-1 ring-border"
							onUpload={(url) => {
								queue.commitResult(
									avatarNode,
									{ imageUrl: url, durationSec: 0 },
									{ pinned: true },
								);
								update({ avatarUploaded: true });
							}}
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
					regenerateAvatar();
					onClose();
				}}
			/>
		</DialogContent>
	);
}
