"use client";

import { Mic } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useAssetEditors } from "./character/AssetEditProvider";
import { HeaderIconButton } from "./HeaderIconButton";

/** Opens the editor of the voice a speech element speaks with: its speaker's, or else the narrator's. */
export function ElementVoiceButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { editSpeaker } = useAssetEditors();
	const open = () => editSpeaker(element.generationAttributes?.name);

	return (
		<SimpleTooltip label="Edit voice">
			<HeaderIconButton ariaLabel="Edit voice" onClick={open}>
				<Mic size={14} />
			</HeaderIconButton>
		</SimpleTooltip>
	);
}
