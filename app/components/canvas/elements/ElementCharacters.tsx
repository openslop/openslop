"use client";

import { useSlateStatic } from "slate-react";
import { getElementCharacterNames } from "@/lib/canvas/characterNames";
import { isForeground } from "@/lib/canvas/guards";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { CharacterPill } from "./CharacterPill";
import { removeCharacter } from "@/app/components/canvas/utils/characterOps";
import { CharacterSwitcher, CharactersPicker } from "./CharactersPicker";

export function ElementCharacters({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	if (element.type === "character")
		return <CharacterSwitcher element={element} />;
	if (!isForeground(element)) return null;
	const characters = getElementCharacterNames(element);
	return (
		<>
			{characters.map((name) => (
				<CharacterPill
					key={`char:${name}`}
					name={name}
					onRemove={() => removeCharacter(editor, element, name)}
				/>
			))}
			<CharactersPicker element={element} />
		</>
	);
}
