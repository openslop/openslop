"use client";

import { useState } from "react";
import {
	Codesandbox,
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
import {
	SegmentedControl,
	type SegmentedControlOption,
} from "@/components/ui/segmented-control";
import AnimatedPlaceholder from "@/app/components/AnimatedPlaceholder";
import { useAssetEditDialogs } from "@/app/components/canvas/elements/character/useAssetEditDialogs";
import { TEMPLATES, type Template } from "@/lib/templates/templates";
import { templateBrief } from "@/lib/templates/templateBrief";
import { useTemplate } from "@/lib/templates/useTemplate";
import { useProject } from "@/lib/project/useProject";
import {
	LANGUAGE_CHOICES,
	languageLabel,
	type LanguageChoice,
} from "@/lib/project/language";
import { useScriptLanguage } from "@/lib/project/useScriptLanguage";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import {
	useUpdateVideoSettings,
	useVideoSetting,
} from "@/lib/video/useVideoSetting";
import {
	VIDEO_LENGTHS,
	videoLengthLabel,
	type VideoLength,
} from "@/lib/video/videoLength";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import { useSloppy } from "@/app/components/sloppy/SloppyProvider";
import { ActionButton } from "./ActionButton";
import { ComposerAssets } from "./ComposerAssets";
import { SettingPill, type SettingPillOption } from "./SettingPill";

/** What the user says they are giving us. Presentation only: Sloppy reads the text itself. */
type ComposerIntent = "story" | "script";

const INTENT_OPTIONS: SegmentedControlOption<ComposerIntent>[] = [
	{ value: "story", label: "Describe a video" },
	{ value: "script", label: "Paste a script" },
];

const SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

const ASPECT_RATIO_OPTIONS: SettingPillOption<AspectRatio>[] = [
	{ value: "16:9", label: "16:9" },
	{ value: "9:16", label: "9:16" },
];

const VIDEO_LENGTH_OPTIONS: SettingPillOption<VideoLength>[] =
	VIDEO_LENGTHS.map((value) => ({ value, label: videoLengthLabel(value) }));

const LANGUAGE_OPTIONS: SettingPillOption<LanguageChoice>[] =
	LANGUAGE_CHOICES.map((value) => ({ value, label: languageLabel(value) }));

const TEMPLATE_OPTIONS: SettingPillOption<string>[] = TEMPLATES.map((t) => ({
	value: t.id,
	label: t.name,
}));

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
			{template.promptPrefix}
		</span>
	);
}

interface ComposerCopilotProps {
	value: string;
	onValueChange: (value: string) => void;
	onSubmit: (brief: string) => void;
}

export default function ComposerCopilot({
	value,
	onValueChange,
	onSubmit,
}: ComposerCopilotProps) {
	const [intent, setIntent] = useState<ComposerIntent>("story");
	const { template, applyTemplate, clearTemplate } = useTemplate();
	const aspectRatio = useVideoSetting("aspectRatio");
	const videoLength = useVideoSetting("length");
	const updateVideoSettings = useUpdateVideoSettings();
	const addReferenceImages = useProject((s) => s.addReferenceImages);
	const [language, setLanguage] = useScriptLanguage();
	const { model, setModel, models } = useSloppy();
	const {
		openCreateCharacter,
		editCharacter,
		openNarrator,
		openArtStyle,
		dialogs,
	} = useAssetEditDialogs();

	const { openPicker, uploading, uploadingCount, inputElement } =
		useImageUpload({ multiple: true, onUpload: addReferenceImages });
	const hasText = value.trim().length > 0;
	const pasting = intent === "script";
	const activeTemplate = pasting ? undefined : template;

	/** A pasted script sets its own length, so the target goes back to auto. */
	const chooseIntent = (next: ComposerIntent) => {
		setIntent(next);
		if (next === "script") updateVideoSettings({ length: "auto" });
	};

	const handleSubmit = () => {
		if (hasText) onSubmit(templateBrief(activeTemplate, value));
	};

	return (
		<div className="w-full rounded-xl border border-accent/30 bg-card transition-shadow focus-within:shadow-elevation-5">
			<div className="px-4 py-3">
				<div className="mb-3 flex justify-center">
					<SegmentedControl
						value={intent}
						options={INTENT_OPTIONS}
						onChange={chooseIntent}
						ariaLabel="What you are giving Sloppy"
					/>
				</div>
				<ComposerAssets
					uploadingCount={uploadingCount}
					onEditCharacter={editCharacter}
					onEditNarrator={openNarrator}
					onEditArtStyle={openArtStyle}
				/>
				<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline">
					{activeTemplate && (
						<TemplatePill template={activeTemplate} onRemove={clearTemplate} />
					)}
					<div className="min-w-0 flex-1 grid [&>*]:[grid-area:1/1]">
						<textarea
							rows={pasting ? 8 : 2}
							aria-label={pasting ? "Paste your script" : "Enter your prompt"}
							value={value}
							onChange={(e) => onValueChange(e.target.value)}
							onKeyDown={(e) => {
								if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
									handleSubmit();
							}}
							placeholder={pasting ? SCRIPT_PLACEHOLDER : undefined}
							style={{ fieldSizing: "content" }}
							className=" max-h-[40vh] w-full resize-none overflow-y-auto bg-transparent font-body text-body text-foreground caret-accent placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:rounded-sm"
						/>
						{!hasText && !activeTemplate && !pasting && (
							<div className="pointer-events-none overflow-hidden font-body text-body">
								<AnimatedPlaceholder />
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
						<SettingPill
							name="Aspect ratio"
							icon={<Proportions className="mr-1 h-3 w-3" />}
							value={aspectRatio}
							options={ASPECT_RATIO_OPTIONS}
							onChange={(next: AspectRatio) =>
								updateVideoSettings({ aspectRatio: next })
							}
						/>
						<SettingPill
							name="Language"
							icon={<Translate className="mr-1 h-3 w-3" />}
							value={language}
							options={LANGUAGE_OPTIONS}
							onChange={setLanguage}
						/>
						<SettingPill
							name="Model"
							icon={<Codesandbox className="mr-1 h-3 w-3" />}
							value={model}
							options={models.map((value) => ({ value, label: value }))}
							onChange={setModel}
						/>
						<SettingPill
							name="Video length"
							icon={<Hourglass className="mr-1 h-3 w-3" />}
							value={videoLength}
							options={VIDEO_LENGTH_OPTIONS}
							disabled={pasting}
							onChange={(next: VideoLength) =>
								updateVideoSettings({ length: next })
							}
						/>
						{activeTemplate && (
							<SettingPill
								name="Template"
								className="relative overflow-hidden"
								style={{ backgroundColor: activeTemplate.color }}
								value={activeTemplate.id}
								options={TEMPLATE_OPTIONS}
								onChange={applyTemplate}
							/>
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
