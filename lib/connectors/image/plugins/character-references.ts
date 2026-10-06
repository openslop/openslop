import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
	shownCharacters,
} from "@/lib/canvas/characterNames";
import { withReferences } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { dependency, dependencyPerName } from "@/lib/generation/dependency";
import { findAsset, hasAvatar } from "@/lib/canvas/assets";

export type ParamsWithCharacters = {
	prompt: string;
	referenceImages?: string[];
	[CHARACTERS_ATTR]?: string;
};

export const characterAvatars = dependencyPerName(shownCharacters, (name) =>
	dependency(`avatar:${name}`, `${name}'s avatar`, (_, { canvas }) => {
		const character = findAsset(canvas, "asset_character", name);
		return character && hasAvatar(character) ? character : undefined;
	}),
);

/** Avatars arrive as dependency results, so this never races the jobs making them. */
export function createCharacterReferencesPlugin(): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-references",
		dependencies: [characterAvatars],
		beforeGenerate(params, ctx) {
			const { [CHARACTERS_ATTR]: characters, ...rest } = params;
			if (!characters) return params;

			const avatars = compact(
				parseCharacterNames(characters).map(
					(name) => characterAvatars.read(name, ctx)?.imageUrl,
				),
			);
			if (avatars.length === 0) return rest;

			return withReferences(
				{ ...rest, prompt: `${rest.prompt}. No nameplates` },
				avatars,
			);
		},
	};
}
