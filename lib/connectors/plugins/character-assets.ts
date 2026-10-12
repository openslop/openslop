import pickBy from "lodash/pickBy";
import { findAsset } from "@/lib/canvas/assets";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
	shownCharacters,
} from "@/lib/canvas/character-names";
import type {
	Character,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import { foundVoice, speakerVoices } from "@/lib/connectors/voice/voices";
import type { Dependency } from "@/lib/generation/declare";

export type ParamsWithCharacters = {
	prompt: string;
	characterAssets?: Character[];
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
			const { [CHARACTERS_ATTR]: names, ...rest } = params;
			const characters = parseCharacterNames(names)
				.map((name) => characterOf(ctx, name))
				.filter(({ avatarUrl, voice }) => avatarUrl || voice);
			if (characters.length === 0) return rest;

			return {
				...rest,
				prompt: characters.some(({ avatarUrl }) => avatarUrl)
					? `${rest.prompt}. No nameplates`
					: rest.prompt,
				characterAssets: characters,
			};
		},
	};
}
