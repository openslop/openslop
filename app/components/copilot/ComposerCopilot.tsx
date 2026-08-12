"use client";

import type { ReactNode } from "react";
import {
	ChevronDown,
	CornerDownLeft,
	Hourglass,
	ImagePlus,
	Loader2,
	Mic,
	Palette,
	Plus,
	Proportions,
	Translate,
	User,
	X,
} from "@/components/ui/icon";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { cn } from "@/lib/utils";
import { useAssetEditDialogs } from "@/app/components/canvas/elements/character/useAssetEditDialogs";
import {
	TEMPLATES,
	getTemplate,
	type Template,
} from "@/lib/templates/templates";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import {
	LANGUAGE_CHOICES,
	languageLabel,
	type LanguageChoice,
} from "@/lib/project/language";
import { useScriptLanguage } from "@/lib/project/useScriptLanguage";
import type { Mode } from "@/lib/project/types";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import { useAspectRatio } from "@/lib/video/useAspectRatio";
import {
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
	type VideoLength,
} from "@/lib/video/videoLength";
import { useVideoLength } from "@/lib/video/useVideoLength";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { ActionButton } from "./ActionButton";
import { ComposerAssets } from "./ComposerAssets";

const MODE_LABELS: Record<Mode, string> = {
	story: "Describe a story",
	script: "Paste in a script",
	template: "Use a template",
};

const MODE_OPTIONS: SelectMenuOption<Mode>[] = (
	Object.keys(MODE_LABELS) as Mode[]
).map((value) => ({ value, label: MODE_LABELS[value] }));

const ASPECT_RATIO_OPTIONS: SelectMenuOption<AspectRatio>[] = [
	{ value: "16:9", label: "16:9" },
	{ value: "9:16", label: "9:16" },
];

const VIDEO_LENGTH_OPTIONS: SelectMenuOption<VideoLength>[] = VIDEO_LENGTHS.map(
	(value) => ({ value, label: VIDEO_LENGTH_SPECS[value].label }),
);

const LANGUAGE_OPTIONS: SelectMenuOption<LanguageChoice>[] =
	LANGUAGE_CHOICES.map((value) => ({ value, label: languageLabel(value) }));

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
				"focus-ring inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-body text-label text-foreground transition-colors hover:bg-button-hover",
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
	onSetArtStyle,
}: {
	openPicker: () => void;
	uploading: boolean;
	onCreateCharacter: () => void;
	onSelectNarrator: () => void;
	onSetArtStyle: () => void;
}) {
	const iconClass = "mr-1.5 h-3.5 w-3.5 text-foreground";
	const items: ActionMenuItem[] = [
		{
			key: "upload",
			label: "Upload reference images",
			icon: <ImagePlus className={iconClass} />,
			onSelect: openPicker,
		},
		{
			key: "character",
			label: "Create character",
			icon: <User className={iconClass} />,
			onSelect: onCreateCharacter,
		},
		{
			key: "narrator",
			label: "Select narrator voice",
			icon: <Mic className={iconClass} />,
			onSelect: onSelectNarrator,
		},
		{
			key: "art-style",
			label: "Set art style",
			icon: <Palette className={iconClass} />,
			onSelect: onSetArtStyle,
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
	template,
	onRemove,
}: {
	template: Template;
	onRemove: () => void;
}) {
	return (
		<span
			className=" relative inline-flex self-start shrink-0 items-center gap-1 overflow-hidden rounded-full py-0.5 pl-1 pr-2 font-body text-body text-foreground whitespace-nowrap sm:mt-px sm:self-auto"
			style={{ backgroundColor: template.color }}
		>
			<button
				type="button"
				aria-label="Remove template"
				onClick={onRemove}
				className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-on-media/20"
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
	placeholder?: string;
	placeholderOverlay?: ReactNode;
}

export default function ComposerCopilot({
	value,
	onValueChange,
	onSubmit,
	placeholder,
	placeholderOverlay,
}: ComposerCopilotProps) {
	const { mode, setMode, selectedTemplateId, selectTemplate } = useConfig();
	const aspectRatio = useAspectRatio();
	const videoLength = useVideoLength();
	const updateMetadata = useProject((s) => s.updateMetadata);
	const addReferenceImages = useProject((s) => s.addReferenceImages);
	const [language, setLanguage] = useScriptLanguage();
	const {
		openCreateCharacter,
		editCharacter,
		openNarrator,
		openArtStyle,
		dialogs,
	} = useAssetEditDialogs();

	const { openPicker, uploading, uploadingCount, inputElement } =
		useImageUpload({ multiple: true, onUpload: addReferenceImages });
	const isTemplateMode = mode === "template";
	const isScriptMode = mode === "script";
	const languageName = languageLabel(language);
	const hasText = value.trim().length > 0;
	const selectedTemplate = getTemplate(selectedTemplateId);

	const handleSubmit = () => {
		if (hasText) onSubmit();
	};

	return (
		<div className="w-full rounded-xl border border-accent/30 bg-card transition-shadow focus-within:shadow-elevation-5">
			<div className="px-4 py-3">
				<ComposerAssets
					uploadingCount={uploadingCount}
					onEditCharacter={editCharacter}
					onEditNarrator={openNarrator}
					onEditArtStyle={openArtStyle}
				/>
				<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
					{isTemplateMode && (
						<TemplatePill
							template={selectedTemplate}
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
							placeholder={placeholder}
							style={{ fieldSizing: "content" }}
							className=" max-h-[40vh] w-full resize-none overflow-y-auto bg-transparent font-body text-body text-foreground caret-accent placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:rounded-sm"
						/>
						{!hasText && !isTemplateMode && placeholderOverlay && (
							<div className="pointer-events-none overflow-hidden font-body text-body">
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
							onSetArtStyle={openArtStyle}
						/>
						<SelectMenu
							value={mode}
							onChange={(next: Mode) =>
								next === "template"
									? selectTemplate(selectedTemplateId)
									: setMode(next)
							}
							options={MODE_OPTIONS}
							itemClassName="rounded-lg text-label-xs"
						>
							<PillTrigger
								aria-label={`Composer mode: ${MODE_LABELS[mode]}`}
								label={MODE_LABELS[mode]}
							/>
						</SelectMenu>
						<SelectMenu
							value={aspectRatio}
							onChange={(next: AspectRatio) =>
								updateMetadata({ videoSettings: { aspectRatio: next } })
							}
							options={ASPECT_RATIO_OPTIONS}
							itemClassName="rounded-lg text-label-xs"
						>
							<PillTrigger
								aria-label={`Aspect ratio: ${aspectRatio}`}
								icon={<Proportions className="mr-1 h-3 w-3" />}
								label={aspectRatio}
							/>
						</SelectMenu>
						<SelectMenu
							value={language}
							onChange={setLanguage}
							options={LANGUAGE_OPTIONS}
							itemClassName="rounded-lg text-label-xs"
						>
							<PillTrigger
								aria-label={`Language: ${languageName}`}
								icon={<Translate className="mr-1 h-3 w-3" />}
								label={languageName}
							/>
						</SelectMenu>
						{!isScriptMode && (
							<SelectMenu
								value={videoLength}
								onChange={(next: VideoLength) =>
									updateMetadata({ videoSettings: { length: next } })
								}
								options={VIDEO_LENGTH_OPTIONS}
								itemClassName="rounded-lg text-label-xs"
							>
								<PillTrigger
									aria-label={`Video length: ${VIDEO_LENGTH_SPECS[videoLength].label}`}
									icon={<Hourglass className="mr-1 h-3 w-3" />}
									label={VIDEO_LENGTH_SPECS[videoLength].label}
								/>
							</SelectMenu>
						)}
						{isTemplateMode && (
							<SelectMenu
								value={selectedTemplateId}
								onChange={selectTemplate}
								options={TEMPLATE_OPTIONS}
								itemClassName="rounded-lg text-label-xs"
							>
								<PillTrigger
									aria-label={`Template: ${selectedTemplate.name}`}
									className="relative overflow-hidden"
									style={{ backgroundColor: selectedTemplate.color }}
									label={selectedTemplate.name}
								/>
							</SelectMenu>
						)}
					</div>
					<ActionButton
						label="Submit"
						icon={<CornerDownLeft className="h-4 w-4" />}
						onClick={handleSubmit}
						disabled={!hasText}
					/>
				</div>
			</div>
			{dialogs}
		</div>
	);
}
