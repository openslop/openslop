import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
	shownCharacters,
} from "@/lib/canvas/characterNames";
import mergeWith from "lodash/mergeWith";
import { appendArrays } from "@/lib/connectors/plugins";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import type { Dependency } from "@/lib/generation/declare";
import { findAsset } from "@/lib/canvas/assets";

export type ParamsWithCharacters = {
	prompt: string;
	referenceImages?: string[];
	[CHARACTERS_ATTR]?: string;
};

const avatarLabel = (name: string) => `${name}'s avatar`;

const shownAvatars: Dependency = (element, { canvas }) =>
	Object.fromEntries(
		shownCharacters(element).map((name) => [
			avatarLabel(name),
			findAsset(canvas, "asset_avatar", name),
		]),
	);

/** Avatars arrive as dependency results, so this never races the jobs making them. */
export function createCharacterReferencesPlugin(): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-references",
		dependencies: [shownAvatars],
		beforeGenerate(params, ctx) {
			const { [CHARACTERS_ATTR]: characters, ...rest } = params;
			const avatars = compact(
				parseCharacterNames(characters).map(
					(name) => ctx.dependencies?.[avatarLabel(name)]?.imageUrl,
				),
			);
			if (avatars.length === 0) return rest;

			return mergeWith(
				{},
				rest,
				{ prompt: `${rest.prompt}. No nameplates`, referenceImages: avatars },
				appendArrays,
			);
		},
	};
}
