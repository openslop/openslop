"use client";

import { useSlateStatic } from "slate-react";
import { removeShownCharacter } from "@/lib/canvas/asset-ops";
import { shownCharacters } from "@/lib/canvas/character-names";
import type { ContentElement } from "@/lib/canvas/types";
import { CharacterPill } from "./character-pill";
import { CharactersPicker } from "./characters-picker";

export function ShownCharacters({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	return (
		<>
			{shownCharacters(element).map((name) => (
				<CharacterPill
					key={`char:${name}`}
					name={name}
					onRemove={() => removeShownCharacter(editor, element, name)}
				/>
			))}
			<CharactersPicker element={element} />
		</>
	);
}
