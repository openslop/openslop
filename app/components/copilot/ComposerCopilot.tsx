"use client";

import type { ReactNode } from "react";
import {
	ChevronDown,
	CornerDownLeft,
	ImagePlus,
	Loader2,
	Mic,
	Plus,
	Proportions,
	User,
	X,
} from "@/components/ui/icon";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import { useAssetEditDialogs } from "@/app/components/canvas/elements/character/useAssetEditDialogs";
import { TEMPLATES, getTemplateById } from "@/lib/templates/templates";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import type { Mode } from "@/lib/project/types";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import { useAspectRatio } from "@/lib/video/useAspectRatio";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { ActionButton } from "./ActionButton";
import { ComposerAssets } from "./ComposerAssets";

const MODE_OPTIONS: SelectMenuOption<Mode>[] = [
	{ value: "story", label: "Describe a story" },
	{ value: "script", label: "Paste in a script" },
	{ value: "template", label: "Use a template" },
];

const ASPECT_RATIO_OPTIONS: SelectMenuOption<AspectRatio>[] = [
	{ value: "16:9", label: "16:9" },
	{ value: "9:16", label: "9:16" },
];

const TEMPLATE_OPTIONS: SelectMenuOption<string>[] = TEMPLATES.map((t) => ({
	value: t.id,
	label: t.name,
}));

function PillTrigger({
	icon,
	label,
	className,
	ref,
	...props
}: React.ComponentProps<"button"> & {
	icon?: ReactNode;
	label: ReactNode;
}) {
	return (
		<button
			ref={ref}
			type="button"
			className={cn(
				"inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-body text-label text-foreground transition-colors hover:bg-button-hover",
				className,
			)}
			{...props}
		>
			{icon}
			{label}
			<ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
		</button>
	);
}

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
	const iconClass = "mr-1.5 h-3.5 w-3.5 text-foreground";
	const items: ActionMenuItem[] = [
		{
			key: "upload",
			label: "Upload reference images",
			icon: <ImagePlus className={iconClass} strokeWidth={1.5} />,
			onSelect: openPicker,
		},
		{
			key: "character",
			label: "Create character",
			icon: <User className={iconClass} strokeWidth={1.5} />,
			onSelect: onCreateCharacter,
		},
		{
			key: "narrator",
			label: "Select narrator voice",
			icon: <Mic className={iconClass} strokeWidth={1.5} />,
			onSelect: onSelectNarrator,
		},
	];

	return (
		<ActionMenu
			items={items}
			contentClassName="min-w-36 p-0.5"
			itemClassName="rounded-lg text-label-xs"
		>
			<button
				type="button"
				aria-label="Attach"
				disabled={uploading}
				className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-button-hover disabled:pointer-events-none"
			>
				{uploading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Plus className="h-4 w-4" />
				)}
			</button>
		</ActionMenu>
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
			className=" relative inline-flex self-start shrink-0 items-center gap-1 overflow-hidden rounded-full py-0.5 pl-1 pr-2 font-body text-sm leading-5 text-foreground whitespace-nowrap sm:mt-px sm:self-auto"
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
	const aspectRatio = useAspectRatio();
	const { openCreateCharacter, editCharacter, openNarrator, dialogs } =
		useAssetEditDialogs();

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
		<div className="w-full rounded-xl border border-accent/30 bg-card transition-shadow focus-within:shadow-elevation-5">
			<div className="px-4 py-3">
				<ComposerAssets
					uploadingCount={uploadingCount}
					onEditCharacter={editCharacter}
					onEditNarrator={openNarrator}
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
							className=" w-full resize-none bg-transparent font-body text-sm leading-5 text-foreground caret-accent placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:rounded-sm"
						/>
						{!hasText && !showPill && placeholderOverlay && (
							<div className="pointer-events-none overflow-hidden font-body text-sm">
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
							onCreateCharacter={openCreateCharacter}
							onSelectNarrator={openNarrator}
						/>
						<SelectMenu
							value={mode}
							onChange={(mode: Mode) => {
								setMode(mode);
								if (mode === "template" && selectedTemplateId) {
									applyTemplate(selectedTemplateId);
								}
							}}
							options={MODE_OPTIONS}
							itemClassName="rounded-lg text-label-xs"
						>
							<PillTrigger
								aria-label="Composer mode"
								label={MODE_OPTIONS.find((o) => o.value === mode)?.label}
							/>
						</SelectMenu>
						<SelectMenu
							value={aspectRatio}
							onChange={(next: AspectRatio) => {
								getProjectStore(projectId)
									.getState()
									.updateMetadata({ videoSettings: { aspectRatio: next } });
							}}
							options={ASPECT_RATIO_OPTIONS}
							itemClassName="rounded-lg text-label-xs"
						>
							<PillTrigger
								aria-label="Aspect ratio"
								icon={<Proportions className="mr-1 h-3 w-3" strokeWidth={2} />}
								label={aspectRatio}
							/>
						</SelectMenu>
						{mode === "template" && selectedTemplateId && (
							<SelectMenu
								value={selectedTemplateId}
								onChange={(templateId: string) => {
									setMode("template");
									applyTemplate(templateId);
								}}
								options={TEMPLATE_OPTIONS}
								itemClassName="rounded-lg text-label-xs"
							>
								<PillTrigger
									aria-label="Select template"
									className="relative overflow-hidden"
									style={{
										backgroundColor: getTemplateById(selectedTemplateId)?.color,
									}}
									label={getTemplateById(selectedTemplateId)?.name}
								/>
							</SelectMenu>
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
			{dialogs}
		</div>
	);
}
