import compact from "lodash/compact";
import { parseCharacterNames } from "@/lib/canvas/characterNames";
import type { ConnectorPlugin, PluginContext } from "@/lib/connectors/types";
import { characterAvatarElementId } from "@/lib/project/characterAvatar";
import { characterAvatarNode } from "./characterAvatarNode";

export type ParamsWithCharacters = { prompt: string; characters?: string };

/**
 * Feeds the referenced characters' avatars in as reference images. The avatars
 * arrive as dependency results, so this never races the jobs that produce them.
 */
export function createCharacterReferencesPlugin(): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-references",
		dependencies: (element, ctx) =>
			parseCharacterNames(element.customAttributes?.characters).map((name) =>
				characterAvatarNode(name, ctx),
			),
		beforeGenerate(params, ctx?: PluginContext<ParamsWithCharacters>) {
			const { characters, ...rest } = params;
			if (!characters) return params;

			const referenceImages = compact(
				parseCharacterNames(characters).map(
					(name) =>
						ctx?.dependencies?.[characterAvatarElementId(name)]?.imageUrl,
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
