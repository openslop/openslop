"use client";

import { type ReactNode, useState } from "react";
import {
	CornerDownLeft,
	ImagePlus,
	Loader2,
	Mic,
	Plus,
	User,
	X,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GlassDropdown, {
	type GlassDropdownOption,
} from "@/app/components/GlassDropdown";
import { CharacterEditModal } from "@/app/components/canvas/elements/character/CharacterEditModal";
import { NarratorEditModal } from "@/app/components/canvas/elements/character/NarratorEditModal";
import { NewCharacterDialog } from "@/app/components/canvas/elements/character/NewCharacterDialog";
import { TEMPLATES, getTemplateById } from "@/lib/templates/templates";
import { useConfig, type Mode } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { ActionButton } from "./ActionButton";
import { ComposerAssets } from "./ComposerAssets";

const MODE_OPTIONS: GlassDropdownOption<Mode>[] = [
	{ value: "story", label: "Describe a story" },
	{ value: "script", label: "Paste in a script" },
	{ value: "template", label: "Use a template" },
];

const TEMPLATE_OPTIONS: GlassDropdownOption<string>[] = TEMPLATES.map((t) => ({
	value: t.id,
	label: t.name,
}));

function AttachMenu({
	openPicker,
	uploading,
	onCreateCharacter,
	onSelectNarrator,
}: {
	openPicker: () => void;
	uploading: boolean;
	onCreateCharacter: () => void;
	onSelectNarrator: () => void;
}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Attach"
					disabled={uploading}
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:pointer-events-none"
				>
					{uploading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Plus className="h-4 w-4" />
					)}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				side="bottom"
				align="start"
				className="min-w-36 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-0.5"
			>
				<DropdownMenuItem
					onClick={openPicker}
					className="cursor-pointer rounded-lg px-2 py-1.5 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
				>
					<ImagePlus
						className="mr-1.5 h-3.5 text-white w-3.5"
						strokeWidth={1.5}
					/>
					Upload Reference Images
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onCreateCharacter}
					className="cursor-pointer rounded-lg px-2 py-1.5 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
				>
					<User className="mr-1.5 h-3.5 text-white w-3.5" strokeWidth={1.5} />
					Create character
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onSelectNarrator}
					className="cursor-pointer rounded-lg px-2 py-1.5 text-[11px] text-white/70 hover:text-white focus:text-white focus:bg-white/10"
				>
					<Mic className="mr-1.5 h-3.5 text-white w-3.5" strokeWidth={1.5} />
					Select narrator voice
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function TemplatePill({
	templateId,
	onRemove,
}: {
	templateId: string;
	onRemove: () => void;
}) {
	const template = getTemplateById(templateId);
	if (!template) return null;

	return (
		<span
			className="font-body relative grain inline-flex self-start shrink-0 items-center gap-1 overflow-hidden rounded-full py-0.5 pl-1 pr-2 text-sm leading-5 text-white/80 whitespace-nowrap sm:mt-px sm:self-auto"
			style={{ backgroundColor: template.color }}
		>
			<button
				type="button"
				aria-label="Remove template"
				onClick={onRemove}
				className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-black/20"
			>
				<X className="h-3 w-3" />
			</button>
			{template.pillText}
		</span>
	);
}

interface ComposerCopilotProps {
	value: string;
	onValueChange: (value: string) => void;
	onSubmit: () => void;
	placeholder?: ReactNode;
}

export default function ComposerCopilot({
	value,
	onValueChange,
	onSubmit,
	placeholder,
}: ComposerCopilotProps) {
	const { projectId, mode, setMode, selectedTemplateId, applyTemplate } =
		useConfig();
	const [creatingCharacter, setCreatingCharacter] = useState(false);
	const [editingCharacterName, setEditingCharacterName] = useState<
		string | undefined
	>();
	const [editingNarrator, setEditingNarrator] = useState(false);

	const { openPicker, uploading, uploadingCount, inputElement } =
		useImageUpload({
			multiple: true,
			onUpload: (urls) => {
				const store = getProjectStore(projectId).getState();
				store.setReferenceImages([...store.referenceImages, ...urls]);
			},
		});
	const showPill = mode === "template" && selectedTemplateId !== undefined;
	const hasText = value.trim().length > 0;

	const handleSubmit = () => {
		if (hasText) onSubmit();
	};

	const placeholderOverlay =
		typeof placeholder !== "string" ? placeholder : undefined;
	const placeholderText =
		typeof placeholder === "string" ? placeholder : undefined;

	return (
		<div className="w-full rounded-xl border border-violet-500/30 bg-white/5 shadow-[0_0_40px_rgba(55,30,100,0.5)]">
			<div className="px-4 py-3">
				<ComposerAssets
					uploadingCount={uploadingCount}
					onEditCharacter={setEditingCharacterName}
					onEditNarrator={() => setEditingNarrator(true)}
				/>
				<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
					{showPill && (
						<TemplatePill
							templateId={selectedTemplateId}
							onRemove={() => setMode("story")}
						/>
					)}
					<div className="min-w-0 flex-1 grid [&>*]:[grid-area:1/1]">
						<textarea
							rows={2}
							aria-label="Enter your prompt"
							value={value}
							onChange={(e) => onValueChange(e.target.value)}
							onKeyDown={(e) => {
								if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
									handleSubmit();
							}}
							placeholder={placeholderText}
							style={{ fieldSizing: "content" }}
							className="font-body w-full resize-none bg-transparent text-sm leading-5 text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
						/>
						{!hasText && !showPill && placeholderOverlay && (
							<div className="font-body pointer-events-none overflow-hidden text-sm">
								{placeholderOverlay}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center gap-2">
						{inputElement}
						<AttachMenu
							openPicker={openPicker}
							uploading={uploading}
							onCreateCharacter={() => setCreatingCharacter(true)}
							onSelectNarrator={() => setEditingNarrator(true)}
						/>
						<GlassDropdown
							value={mode}
							onChange={(mode: Mode) => {
								setMode(mode);
								if (mode === "template" && selectedTemplateId) {
									applyTemplate(selectedTemplateId);
								}
							}}
							options={MODE_OPTIONS}
							ariaLabel="Composer mode"
							side="bottom"
						/>
						{mode === "template" && selectedTemplateId && (
							<GlassDropdown
								value={selectedTemplateId}
								onChange={(templateId: string) => {
									setMode("template");
									applyTemplate(templateId);
								}}
								options={TEMPLATE_OPTIONS}
								ariaLabel="Select template"
								side="bottom"
								className="relative grain overflow-hidden"
								style={{
									backgroundColor: getTemplateById(selectedTemplateId)?.color,
								}}
							/>
						)}
					</div>
					<ActionButton
						label="Submit"
						icon={<CornerDownLeft className="h-4 w-4" strokeWidth={2.5} />}
						onClick={handleSubmit}
						disabled={!hasText}
					/>
				</div>
			</div>
			<NewCharacterDialog
				open={creatingCharacter}
				onOpenChange={setCreatingCharacter}
				onCreated={(name) => {
					setCreatingCharacter(false);
					setEditingCharacterName(name);
				}}
			/>
			<CharacterEditModal
				open={editingCharacterName !== undefined}
				onOpenChange={(open) => !open && setEditingCharacterName(undefined)}
				name={editingCharacterName}
			/>
			<NarratorEditModal
				open={editingNarrator}
				onOpenChange={setEditingNarrator}
			/>
		</div>
	);
}
