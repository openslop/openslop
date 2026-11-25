"use client";

import { useSlateStatic } from "slate-react";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { updateElementText } from "@/lib/canvas/editor-ops";
import type { PictureType } from "@/lib/canvas/assets";
import type { AssetElement } from "@/lib/canvas/types";
import { ModelAttribute } from "../attributes/model-attribute";
import { ElementGenerationProvider } from "../element-generation-context";
import {
	ElementGenerateButton,
	ElementStaleIndicator,
} from "../generate-button";
import { ElementHistoryPopover } from "../element-history-popover";
import { ElementSettings } from "../element-settings";
import { ResetEditsButton } from "../reset-edits-button";
import { AddMediaButton } from "../element-media-picker";
import { OutputPreview } from "../output-preview";
import { TextAreaField } from "./fields";

export function AppearanceEditor({
	element,
	modelLabel,
	placeholder,
}: {
	element: AssetElement<PictureType>;
	modelLabel: string;
	placeholder: string;
}) {
	const editor = useSlateStatic();
	return (
		<ElementGenerationProvider element={element}>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="@container/element flex min-w-0 flex-col gap-2">
					<TextAreaField
						className="min-h-0 flex-1"
						label="Appearance"
						autoFocus
						aside={
							<div className="flex items-center gap-1">
								<ModelAttribute element={element} label={modelLabel} />
								<ElementSettings element={element} />
								<ElementHistoryPopover elementId={element.id} />
							</div>
						}
						value={getElementBodyText(element)}
						onChange={(text) => updateElementText(editor, element.id, text)}
						placeholder={placeholder}
					/>
					<div className="flex items-center justify-end gap-2">
						<ElementStaleIndicator />
						<ResetEditsButton />
						<AddMediaButton />
						<ElementGenerateButton />
					</div>
				</div>
				<OutputPreview outputKind="image" />
			</div>
		</ElementGenerationProvider>
	);
}
