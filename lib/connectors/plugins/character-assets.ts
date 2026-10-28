import pickBy from "lodash/pickBy";
import { findAsset } from "@/lib/canvas/assets";
import type { CanvasElement } from "@/lib/canvas/types";
import { referencedNames } from "@/lib/connectors/character-refs";
import { isPictured, isVoiced } from "@/lib/connectors/characters";
import type {
	Character,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { foundVoice, speakerVoices } from "@/lib/connectors/voice/voices";
import type { Dependency } from "@/lib/generation/declare";
import { getPromptText } from "@/lib/generation/inputs";

export type ParamsWithCharacters = {
	prompt: string;
	characterAssets?: Character[];
};

const shownCharacters = (element: CanvasElement): string[] =>
	referencedNames(getPromptText(element));

const avatarLabel = (name: string) => `${name}'s avatar`;

const shownAvatars: Dependency = (element, { canvas }) =>
	Object.fromEntries(
		shownCharacters(element).map((name) => [
			avatarLabel(name),
			findAsset(canvas, "asset_avatar", name),
		]),
	);

const characterOf = (ctx: PluginContext, name: string): Character => {
	const voice = foundVoice(ctx, name);
	return {
		name,
		...pickBy({
			avatarUrl: ctx.dependencies?.[avatarLabel(name)]?.imageUrl,
			voice: voice?.audioUrl
				? { url: voice.audioUrl, durationSec: voice.durationSec }
				: undefined,
		}),
	};
};

/** Assets arrive as dependency results, so this never races the jobs making them. */
export function createCharacterAssetsPlugin({
	voices,
}: {
	voices: boolean;
}): ConnectorPlugin<ParamsWithCharacters> {
	return {
		name: "character-assets",
		dependencies: voices
			? [shownAvatars, speakerVoices(shownCharacters)]
			: [shownAvatars],
		beforeGenerate(params, ctx) {
			const characters = referencedNames(params.prompt)
				.map((name) => characterOf(ctx, name))
				.filter((character) => isPictured(character) || isVoiced(character));
			if (characters.length === 0) return params;

			return {
				...params,
				prompt: characters.some(isPictured)
					? `${params.prompt}. No nameplates`
					: params.prompt,
				characterAssets: characters,
			};
		},
	};
}
