"use client";

import { Mic } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	type AssetEditors,
	useAssetEditors,
} from "./character/AssetEditProvider";
import { HeaderIconButton } from "./HeaderIconButton";

/** Opens the editor of the voice a speech element speaks with. */
export function ElementVoiceButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const open = voiceEditor(element, useAssetEditors());
	if (!open) return null;

	return (
		<SimpleTooltip label="Edit voice">
			<HeaderIconButton ariaLabel="Edit voice" onClick={open}>
				<Mic size={14} />
			</HeaderIconButton>
		</SimpleTooltip>
	);
}

function voiceEditor(
	element: CanvasContentElement,
	editors: AssetEditors,
): (() => void) | undefined {
	if (element.type === "narration") return editors.openNarrator;
	const name = element.generationAttributes?.name;
	if (element.type === "character" && name)
		return () => editors.editCharacter(name);
	return undefined;
}
