"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	MountedDialog,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
		!!avatarSnapshot.result &&
		isStaleResult(
			avatarSnapshot,
			getGenerationInputs(
				characterAvatarElement(name, character.appearance),
				metadata,
			),
		);

	// The appearance the current avatar was generated from lives in the queue's
	// resultInputs (the same record staleness compares against). Offer it as a
	// cheap "discard my appearance draft" whenever the appearance has diverged
	// from it. Reverting only discards the draft — if the art style or reference
	// images also changed, the avatar stays stale afterwards.
	const sourceAppearance = avatarSnapshot.resultInputs?.attributes?.appearance;
	const revertTo =
		isStale &&
		typeof sourceAppearance === "string" &&
		sourceAppearance !== character.appearance
			? sourceAppearance
			: undefined;

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
				className="absolute right-3 top-3 z-10 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet/50"
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
					<TextAreaField
						label="Appearance"
						value={character.appearance}
						onChange={(appearance) => update({ appearance })}
						placeholder="Describe the character's look"
						action={
							revertTo !== undefined ? (
								<button
									type="button"
									onClick={() => update({ appearance: revertTo })}
									title="Restore the appearance the avatar was generated from"
									className="text-[11px] text-white/50 underline-offset-2 transition-colors hover:text-white hover:underline"
								>
									Revert
								</button>
							) : undefined
						}
					/>
					<div className="relative">
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
						{inputElement}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={openPicker}
									disabled={uploading}
									aria-label="Upload image"
									className="grain grain-light absolute left-2 top-11 z-10 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-black/55 ring-1 ring-inset ring-white/10 backdrop-blur-xl transition-colors hover:bg-black/70 disabled:opacity-60"
								>
									{uploading ? (
										<Loader2 className="h-3 w-3 animate-spin text-white" />
									) : (
										<ImagePlus className="h-3 w-3 text-white" />
									)}
								</button>
							</TooltipTrigger>
							<TooltipContent>Upload image</TooltipContent>
						</Tooltip>
					</div>
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
