"use client";

import { Mic } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { ContentElement } from "@/lib/canvas/types";
import { useAssetEditors } from "./asset-edit-context";
import { HeaderIconButton } from "./header-icon-button";

/** Opens the editor of the voice its speaker speaks with, once it has one. */
export function ElementVoiceButton({ element }: { element: ContentElement }) {
	const { editCharacter } = useAssetEditors();
	const name = element.generationAttributes?.name;
	if (!name) return null;

	return (
		<SimpleTooltip label="Edit voice">
			<HeaderIconButton
				ariaLabel="Edit voice"
				onClick={() => editCharacter("asset_voice", name)}
			>
				<Mic />
			</HeaderIconButton>
		</SimpleTooltip>
	);
}
