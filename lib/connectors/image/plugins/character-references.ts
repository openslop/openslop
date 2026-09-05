import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
} from "@/lib/canvas/characterNames";
import type { ConnectorPlugin, PluginContext } from "@/lib/connectors/types";
import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import { forCharacterAvatar } from "./characterAvatarNode";

export type ParamsWithCharacters = {
	prompt: string;
	[CHARACTERS_ATTR]?: string;
};

/** Avatars arrive as dependency results, so this never races the jobs making them. */
export function createCharacterReferencesPlugin(): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-references",
		dependencies: (element) =>
			parseCharacterNames(element.generationAttributes?.[CHARACTERS_ATTR]).map(
				forCharacterAvatar,
			),
		beforeGenerate(params, ctx: PluginContext<ParamsWithCharacters>) {
			const { [CHARACTERS_ATTR]: characters, ...rest } = params;
			if (!characters) return params;

			const referenceImages = compact(
				parseCharacterNames(characters).map(
					(name) =>
						ctx.dependencies?.[characterAvatarElementId(name)]?.imageUrl,
				),
			);
			if (referenceImages.length === 0) return rest;

			return {
				...rest,
				prompt: `${rest.prompt}. No nameplates`,
				referenceImages,
			};
		},
	};
}
