"use client";

import { useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { useSlateStatic } from "slate-react";
import { clearDraft, ensureDraft } from "@/lib/canvas/asset-ops";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import {
	PLAYGROUND_CONTENT_TYPES,
	playgroundTypeOf,
	type AssetElement,
	type PlaygroundContentType,
} from "@/lib/canvas/types";
import { useAsset } from "@/lib/canvas/use-assets";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { SelectMenu, SelectMenuTrigger } from "@/components/ui/select-menu";
import { ModelAttribute } from "../elements/attributes/model-attribute";
import { ELEMENT_CONFIGS } from "../elements/element-configs";
import { ElementTypeIcon } from "../elements/element-type-icon";
import {
	ElementGenerationProvider,
	useElementGeneration,
} from "../elements/element-generation-context";
import { GenerateButton } from "../elements/generate-button";
import { ResetButton } from "../elements/reset-edits-button";
import { PanelCard, PanelField } from "../panel/panel-card";
import { DraftPictures, DraftSettings } from "./draft-attributes";
import { DraftPrompt } from "./draft-prompt";

const TYPE_OPTIONS = PLAYGROUND_CONTENT_TYPES.map((type) => ({
	value: type,
	label: ELEMENT_CONFIGS[type].label,
	icon: <ElementTypeIcon type={type} />,
}));

function TypeSelect({
	value,
	onChange,
}: {
	value: PlaygroundContentType;
	onChange: (type: PlaygroundContentType) => void;
}) {
	return (
		<SelectMenu value={value} onChange={onChange} options={TYPE_OPTIONS}>
			<SelectMenuTrigger aria-label="Type">
				<ElementTypeIcon type={value} />
				{ELEMENT_CONFIGS[value].label}
			</SelectMenuTrigger>
		</SelectMenu>
	);
}

/** The draft for a type, made whenever the playground turns to it and it is missing. */
function useDraft(type: PlaygroundContentType) {
	const editor = useSlateStatic();
	const draftType = playgroundTypeOf(type);
	const draft = useAsset(draftType);
	const missing = !draft;
	useEffect(() => {
		if (missing) ensureDraft(editor, draftType);
	}, [editor, draftType, missing]);
	return draft;
}

function ClearDraftButton({ draft }: { draft: AssetElement }) {
	const editor = useSlateStatic();
	const blank =
		!getElementBodyText(draft) && isEmpty(draft.generationAttributes);
	if (blank) return null;
	return (
		<ResetButton
			tooltip="Clear the prompt and settings"
			onClick={() => clearDraft(editor, draft.id)}
		/>
	);
}

/** Each run makes a new take in the media, so a draft only ever generates. */
function DraftGenerateButton() {
	const { hasPrompt, status, generate } = useElementGeneration();
	return (
		<GenerateButton
			status={status}
			hasResult={false}
			disabled={!hasPrompt || isGenerationActive(status)}
			onGenerate={generate}
		/>
	);
}

/** One draft per type: switching type keeps each one's prompt and settings. */
export function DraftCard({
	type,
	onTypeChange,
}: {
	type: PlaygroundContentType;
	onTypeChange: (type: PlaygroundContentType) => void;
}) {
	const draft = useDraft(type);
	return (
		<PanelCard title="Generate">
			<PanelField label="Type">
				<TypeSelect value={type} onChange={onTypeChange} />
			</PanelField>
			{draft && !ELEMENT_CONFIGS[type].hidesModel && (
				<PanelField label="Model">
					<ModelAttribute element={draft} label="Model" look="panel" />
				</PanelField>
			)}
			{draft && (
				<ElementGenerationProvider element={draft}>
					<DraftPictures element={draft} />
					<DraftPrompt draft={draft} />
					<DraftSettings element={draft} />
					<div className="flex items-center justify-end gap-2">
						<ClearDraftButton draft={draft} />
						<DraftGenerateButton />
					</div>
				</ElementGenerationProvider>
			)}
		</PanelCard>
	);
}
