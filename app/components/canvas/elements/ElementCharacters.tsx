"use client";

import { useSlateStatic } from "slate-react";
import { getElementCharacterNames } from "@/lib/canvas/characterNames";
import {
	IMAGE_AUTHORED_TYPES,
	type CanvasContentElement,
} from "@/lib/canvas/types";
import { CharacterPill } from "./CharacterPill";
import {
	CharacterSwitcher,
	CharactersPicker,
	removeCharacter,
} from "./CharactersPicker";

export function ElementCharacters({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	if (element.type === "character")
		return <CharacterSwitcher element={element} />;
	if (!IMAGE_AUTHORED_TYPES.has(element.type)) return null;
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
