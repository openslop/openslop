"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
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
import { MediaPlaceholder, MediaPreview } from "../preview/results";
import { TextAreaField } from "./fields";
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

	const avatarElementId = characterAvatarElementId(name);
	const avatarSnapshot = useQueueSelector((q) =>
		q.getElementSnapshot(avatarElementId),
	);

	if (!character) return null;

	const update = (partial: Partial<MetadataCharacter>) =>
		setCharacter(name, { ...character, ...partial });

	const regenerateAvatar = () =>
		queue.enqueue(buildCharacterAvatarJob(projectId, name, connectorConfig));

	const isStale = isStaleResult(
		avatarSnapshot,
		getGenerationInputs(
			characterAvatarElement(name, character.appearance),
			metadata,
		),
	);

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
		<DialogContent className="max-w-2xl">
			<DialogHeader className="shrink-0">
				<DialogTitle>{name}</DialogTitle>
				<DialogDescription>
					Edits save automatically. Regenerate the avatar after changing the
					appearance.
				</DialogDescription>
			</DialogHeader>

			<div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
				<div className="grid gap-4 sm:grid-cols-2">
					<TextAreaField
						label="Appearance"
						value={character.appearance}
						onChange={(appearance) => update({ appearance })}
						placeholder="Describe the character's look"
					/>
					{character.avatarUrl ? (
						<MediaPreview
							key={character.avatarUrl}
							url={character.avatarUrl}
							outputKind="image"
							borderColor="border-white/20"
							status={avatarSnapshot.status}
							seconds={avatarSnapshot.seconds}
							stale={isStale}
							onRegenerate={regenerateAvatar}
						/>
					) : (
						<MediaPlaceholder
							status={avatarSnapshot.status}
							seconds={avatarSnapshot.seconds}
							error={avatarSnapshot.error}
							onGenerate={regenerateAvatar}
							onDiscard={() => queue.discard(avatarElementId)}
						/>
					)}
				</div>
				<VoiceSection voice={character} onChange={update} />
			</div>

			<DialogFooter className="shrink-0">
				<button
					type="button"
					onClick={handleDelete}
					className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] transition-colors ${
						confirmDelete
							? "border-rose-500/60 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
							: "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
					}`}
				>
					<Trash2 className="h-3 w-3" />
					{confirmDelete ? "Confirm delete" : "Delete"}
				</button>
			</DialogFooter>
		</DialogContent>
	);
}
