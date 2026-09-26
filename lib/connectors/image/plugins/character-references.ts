import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
} from "@/lib/canvas/characterNames";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import {
	dependency,
	type DependencyDeclaration,
} from "@/lib/generation/dependency";
import { forCharacterAvatar } from "./characterAvatarNode";

export type ParamsWithCharacters = {
	prompt: string;
	referenceImages?: string[];
	[CHARACTERS_ATTR]?: string;
};

const avatarOf = (name: string) =>
	dependency(`avatar:${name}`, () => forCharacterAvatar(name));

export const characterAvatars: DependencyDeclaration = {
	specs: (element) =>
		parseCharacterNames(
			element.generationAttributes?.[CHARACTERS_ATTR],
		).flatMap((name) => avatarOf(name).specs(element)),
};

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
					(name) => avatarOf(name).read(ctx)?.imageUrl,
				),
			);
			if (avatars.length === 0) return rest;

			return {
				...rest,
				prompt: `${rest.prompt}. No nameplates`,
				referenceImages: [...(rest.referenceImages ?? []), ...avatars],
			};
		},
	};
}
