"use client";

import { useSlateStatic } from "slate-react";
import { removeShownCharacter } from "@/lib/canvas/assetOps";
import { shownCharacters } from "@/lib/canvas/characterNames";
import type { ContentElement } from "@/lib/canvas/types";
import { CharacterPill } from "./CharacterPill";
import { CharactersPicker } from "./CharactersPicker";

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
