"use client";

import { useEffect } from "react";
import { HistoryEditor } from "slate-history";
import { useSlateStatic } from "slate-react";
import { ensureAsset } from "@/lib/canvas/asset-ops";
import {
	PLAYGROUND_CONTENT_TYPES,
	playgroundTypeOf,
	type PlaygroundContentType,
} from "@/lib/canvas/types";
import { useAsset } from "@/lib/canvas/use-assets";
import { SelectMenu, SelectMenuTrigger } from "@/components/ui/select-menu";
import { ModelAttribute } from "../elements/attributes/model-attribute";
import { ELEMENT_CONFIGS } from "../elements/element-configs";
import { ElementTypeIcon } from "../elements/element-type-icon";
import { ElementGenerationProvider } from "../elements/element-generation-context";
import { ElementGenerateButton } from "../elements/generate-button";
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

/** The draft for a type, made the first time the playground turns to it; kept out of undo. */
function useDraft(type: PlaygroundContentType) {
	const editor = useSlateStatic();
	const draftType = playgroundTypeOf(type);
	useEffect(() => {
		HistoryEditor.withoutSaving(editor, () => ensureAsset(editor, draftType));
	}, [editor, draftType]);
	return useAsset(draftType);
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
					<div className="flex justify-end">
						<ElementGenerateButton />
					</div>
				</ElementGenerationProvider>
			)}
		</PanelCard>
	);
}
