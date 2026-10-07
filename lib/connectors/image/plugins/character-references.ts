import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
	shownCharacters,
} from "@/lib/canvas/characterNames";
import { withReferences } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { dependency } from "@/lib/generation/dependency";
import { findAsset } from "@/lib/canvas/assets";

export type ParamsWithCharacters = {
	prompt: string;
	referenceImages?: string[];
	[CHARACTERS_ATTR]?: string;
};

const characterAvatar = (name: string) =>
	dependency(`${name}'s avatar`, (_, { canvas }) =>
		findAsset(canvas, "asset_avatar", name),
	);

/** Avatars arrive as dependency results, so this never races the jobs making them. */
export function createCharacterReferencesPlugin(): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-references",
		dependencies: (element, ctx) =>
			Object.assign(
				{},
				...shownCharacters(element).map((name) =>
					characterAvatar(name).dependencies(element, ctx),
				),
			),
		beforeGenerate(params, ctx) {
			const { [CHARACTERS_ATTR]: characters, ...rest } = params;
			const avatars = compact(
				parseCharacterNames(characters).map(
					(name) => characterAvatar(name).result(ctx)?.imageUrl,
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
