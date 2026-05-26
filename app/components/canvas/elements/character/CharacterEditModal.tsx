"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfig } from "@/lib/config/ConfigProvider";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import {
	buildCharacterAvatarJob,
	characterAvatarElementId,
} from "@/lib/project/ensureCharacterAvatars";
import { useProjectStore } from "@/lib/project/store";
import type { MetadataCharacter } from "@/lib/project/types";
import { MediaPlaceholder, MediaPreview } from "../preview/results";
import { VoicePicker } from "./VoicePicker";

const FIELD_CLS =
	"w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			{open && name && (
				<CharacterEditDialogBody
					key={name}
					name={name}
					onClose={() => onOpenChange(false)}
				/>
			)}
		</Dialog>
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
	const character = useProjectStore(
		projectId,
		(s) => s.metadata.characters[name],
	);
	const setCharacter = useProjectStore(projectId, (s) => s.setCharacter);
	const removeCharacter = useProjectStore(projectId, (s) => s.removeCharacter);

	const [initialAppearance] = useState(() => character?.appearance ?? "");
	const [initialAvatarUrl] = useState(() => character?.avatarUrl);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const update = <K extends keyof MetadataCharacter>(
		key: K,
		value: MetadataCharacter[K],
	) => {
		if (!character) return;
		setCharacter(name, { ...character, [key]: value });
	};

	const avatarElementId = characterAvatarElementId(name);
	const avatarSnapshot = useQueueSelector((q) =>
		q.getElementSnapshot(avatarElementId),
	);
	const status = avatarSnapshot.status;
	const seconds = avatarSnapshot.seconds;
	const avatarError = avatarSnapshot.error;

	const regenerateAvatar = () => {
		queue.enqueueAll([
			buildCharacterAvatarJob(projectId, name, connectorConfig),
		]);
	};

	const avatarRegenerated =
		(character?.avatarUrl ?? null) !== (initialAvatarUrl ?? null);
	const isStale =
		!!character &&
		character.appearance !== initialAppearance &&
		!avatarRegenerated;

	const voiceFilters = useMemo(
		() => ({
			gender: character?.gender,
			age: character?.age,
			pitch: character?.pitch,
			accent: character?.accent,
			description: character?.description,
			language: character?.language,
		}),
		[
			character?.gender,
			character?.age,
			character?.pitch,
			character?.accent,
			character?.description,
			character?.language,
		],
	);

	if (!character) return null;

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
			<DialogHeader>
				<DialogTitle>{name}</DialogTitle>
				<DialogDescription>
					Edits save automatically. Regenerate the avatar after changing the
					appearance.
				</DialogDescription>
			</DialogHeader>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-2">
					{character.avatarUrl ? (
						<MediaPreview
							key={character.avatarUrl}
							url={character.avatarUrl}
							outputKind="image"
							borderColor="border-white/20"
							status={status}
							seconds={seconds}
							stale={isStale}
							onRegenerate={regenerateAvatar}
						/>
					) : (
						<MediaPlaceholder
							status={status}
							seconds={seconds}
							error={avatarError}
							onGenerate={regenerateAvatar}
							onDiscard={() => queue.discard(avatarElementId)}
						/>
					)}
					<TextAreaField
						label="Appearance"
						value={character.appearance}
						onChange={(v) => update("appearance", v)}
						placeholder="Describe the character's look"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<div className="grid grid-cols-2 gap-2">
						<EnumField
							label="Gender"
							options={TTS_GENDERS}
							value={character.gender}
							onChange={(v) => update("gender", v)}
						/>
						<EnumField
							label="Language"
							options={TTS_LANGUAGES}
							value={character.language}
							onChange={(v) => update("language", v)}
						/>
						<EnumField
							label="Age"
							options={TTS_AGES}
							value={character.age}
							onChange={(v) => update("age", v)}
						/>
						<EnumField
							label="Pitch"
							options={TTS_PITCHES}
							value={character.pitch}
							onChange={(v) => update("pitch", v)}
						/>
						<EnumField
							label="Accent"
							options={TTS_ACCENTS}
							value={character.accent}
							onChange={(v) => update("accent", v)}
						/>
						<TextField
							label="Description"
							value={character.description}
							onChange={(v) => update("description", v)}
							placeholder="Free-text"
						/>
					</div>
				</div>
			</div>

			<VoicePicker
				filters={voiceFilters}
				selectedVoiceId={character.voiceId}
				onSelect={(voice) => update("voiceId", voice.id)}
			/>

			<DialogFooter>
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

function FieldLabel({ children }: { children: ReactNode }) {
	return (
		<span className="text-[11px] uppercase tracking-wide text-white/50">
			{children}
		</span>
	);
}

function TextField({
	label,
	value,
	onChange,
	placeholder,
}: {
	label: string;
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
}) {
	return (
		<label className="flex flex-col gap-1">
			<FieldLabel>{label}</FieldLabel>
			<input
				type="text"
				value={value ?? ""}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={FIELD_CLS}
			/>
		</label>
	);
}

function TextAreaField({
	label,
	value,
	onChange,
	placeholder,
	rows = 4,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
}) {
	return (
		<label className="flex flex-col gap-1">
			<FieldLabel>{label}</FieldLabel>
			<textarea
				rows={rows}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={FIELD_CLS}
			/>
		</label>
	);
}

function EnumField<T extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly T[];
	value: T | undefined;
	onChange: (value: T | undefined) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<FieldLabel>{label}</FieldLabel>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					aria-label={label}
					className={`${FIELD_CLS} flex items-center justify-between text-left`}
				>
					<span className={value ? "text-white" : "text-white/30"}>
						{value ?? "—"}
					</span>
					<ChevronDown className="h-3 w-3 shrink-0 text-white/60" />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="max-h-64 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-0.5 shadow-md shadow-black/40 backdrop-blur-xl"
				>
					<EnumOption
						selected={value === undefined}
						onSelect={() => onChange(undefined)}
					>
						<span className="text-white/50">—</span>
					</EnumOption>
					{options.map((option) => (
						<EnumOption
							key={option}
							selected={option === value}
							onSelect={() => onChange(option)}
						>
							{option}
						</EnumOption>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

function EnumOption({
	selected,
	onSelect,
	children,
}: {
	selected: boolean;
	onSelect: () => void;
	children: ReactNode;
}) {
	return (
		<DropdownMenuItem
			onClick={onSelect}
			className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-white/70 hover:text-white focus:bg-white/10 focus:text-white"
		>
			<span className="flex w-3.5 shrink-0 items-center justify-center">
				{selected && <Check className="h-3 w-3 text-white" aria-hidden />}
			</span>
			{children}
		</DropdownMenuItem>
	);
}
