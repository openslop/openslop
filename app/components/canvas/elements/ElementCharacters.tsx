"use client";

import { useSlateStatic } from "slate-react";
import { getElementCharacterNames } from "@/lib/canvas/characterNames";
import { CharacterPill } from "./CharacterPill";
import {
	CharacterSwitcher,
	CharactersPicker,
	removeCharacter,
} from "./CharactersPicker";
import { useElementGeneration } from "./ElementGenerationContext";

export function ElementCharacters() {
	const { element } = useElementGeneration();
	const editor = useSlateStatic();
	if (element.type === "character")
		return <CharacterSwitcher element={element} />;
	if (element.type !== "image" && element.type !== "animated_image")
		return null;
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
