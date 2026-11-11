"use client";

import isEmpty from "lodash/isEmpty";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { clearDraft } from "@/lib/canvas/asset-ops";
import { requireAsset } from "@/lib/canvas/assets";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import {
	MEDIA_CONTENT_TYPES,
	mediaDraftTypeOf,
	type AssetElement,
	type MediaContentType,
} from "@/lib/canvas/types";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { MediaToggle } from "@/components/ui/media-toggle";
import { ModelAttribute } from "../elements/attributes/model-attribute";
import { ELEMENT_CONFIGS } from "../elements/element-configs";
import {
	ElementGenerationProvider,
	useElementGeneration,
} from "../elements/element-generation-context";
import { GenerateButton } from "../elements/generate-button";
import { ResetButton } from "../elements/reset-edits-button";
import { PanelCard, PanelField } from "../panel/panel-card";
import { DraftPictures, DraftSettings } from "./draft-attributes";
import { DraftPrompt } from "./draft-prompt";

const TYPE_OPTIONS = MEDIA_CONTENT_TYPES.map((type) => ({
	value: type,
	label: ELEMENT_CONFIGS[type].label,
	text: ELEMENT_CONFIGS[type].label,
	icon: ELEMENT_CONFIGS[type].Icon,
}));

function ClearDraftButton({ draft }: { draft: AssetElement }) {
	const editor = useSlateStatic();
	const blank =
		!getElementBodyText(draft) && isEmpty(draft.generationAttributes);
	if (blank) return null;
	return (
		<ResetButton
			tooltip="Clear the prompt and settings"
			onClick={() => clearDraft(editor, draft.id)}
			className="w-full"
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
			className="w-full"
		/>
	);
}

/** One draft per type: switching type keeps each one's prompt and settings. */
export function DraftCard({
	type,
	onTypeChange,
}: {
	type: MediaContentType;
	onTypeChange: (type: MediaContentType) => void;
}) {
	const draft = useSlateSelector((editor) =>
		requireAsset(editor.children, mediaDraftTypeOf(type)),
	);
	return (
		<PanelCard title="Generate">
			<MediaToggle
				ariaLabel="Type"
				value={type}
				onChange={onTypeChange}
				options={TYPE_OPTIONS}
			/>
			{!ELEMENT_CONFIGS[type].hidesModel && (
				<PanelField label="Model">
					<ModelAttribute element={draft} label="Model" look="panel" />
				</PanelField>
			)}
			<ElementGenerationProvider element={draft}>
				<DraftPictures element={draft} />
				<DraftPrompt draft={draft} />
				<DraftSettings element={draft} />
				<DraftGenerateButton />
				<ClearDraftButton draft={draft} />
			</ElementGenerationProvider>
		</PanelCard>
	);
}
