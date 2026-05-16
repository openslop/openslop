"use client";

import { useSlateStatic } from "slate-react";
import type { CanvasContentElement } from "../types";
import { getElementCharacterNames } from "../utils/characters";
import { CharacterPill } from "./CharacterBadge";
import { CharactersPicker, removeCharacter } from "./CharactersPicker";

export function ElementCharacters({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
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
			{characters.length > 0 && <CharactersPicker element={element} />}
		</>
	);
}
