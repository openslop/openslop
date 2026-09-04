"use client";

import { Mic } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useAssetEditors } from "./character/AssetEditProvider";
import { HeaderIconButton } from "./HeaderIconButton";

/** Opens the editor of the voice a speech element speaks with. */
export function ElementVoiceButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { openNarrator, editCharacter } = useAssetEditors();
	const open = voiceEditor(element, { openNarrator, editCharacter });
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
	{
		openNarrator,
		editCharacter,
	}: {
		openNarrator: () => void;
		editCharacter: (name: string) => void;
	},
): (() => void) | undefined {
	if (element.type === "narration") return openNarrator;
	const name = element.generationAttributes?.name;
	if (element.type === "character" && name) return () => editCharacter(name);
	return undefined;
}
