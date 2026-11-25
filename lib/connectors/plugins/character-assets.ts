import pickBy from "lodash/pickBy";
import { findImageAsset } from "@/lib/canvas/assets";
import type { CanvasElement } from "@/lib/canvas/types";
import { referencedNames } from "@/lib/connectors/name-refs";
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

const imageLabel = (name: string) => `${name}'s image`;

const shownImages: Dependency = (element, { canvas }) =>
	Object.fromEntries(
		shownCharacters(element).map((name) => [
			imageLabel(name),
			findImageAsset(canvas, name),
		]),
	);

const characterOf = (ctx: PluginContext, name: string): Character => {
	const voice = foundVoice(ctx, name);
	return {
		name,
		...pickBy({
			avatarUrl: ctx.dependencies?.[imageLabel(name)]?.imageUrl,
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
			? [shownImages, speakerVoices(shownCharacters)]
			: [shownImages],
		beforeGenerate(params, ctx) {
			const characters = referencedNames(params.prompt)
				.map((name) => characterOf(ctx, name))
				.filter((character) => isPictured(character) || isVoiced(character));
			if (characters.length === 0) return params;

			return { ...params, characterAssets: characters };
		},
	};
}
