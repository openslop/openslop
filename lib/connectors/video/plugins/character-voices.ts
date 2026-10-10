import {
	CHARACTERS_ATTR,
	parseCharacterNames,
} from "@/lib/canvas/character-names";
import { modelEntry, resolveModel } from "@/lib/connectors/models";
import { foundVoice, speakerVoices } from "@/lib/connectors/voice/voices";
import type {
	ConnectorPlugin,
	ModelRef,
	ReferenceAudio,
} from "@/lib/connectors/types";

export type ParamsWithCharacterVoices = Partial<ModelRef> & {
	prompt: string;
	referenceAudios?: ReferenceAudio[];
	[CHARACTERS_ATTR]?: string;
};

const listens = (model: ModelRef) =>
	Boolean(modelEntry("video", model).referenceAudios);

const heardCharacters = (
	attrs: Partial<ModelRef> & { [CHARACTERS_ATTR]?: string } = {},
) =>
	listens(resolveModel("video", attrs))
		? parseCharacterNames(attrs[CHARACTERS_ATTR])
		: [];

/** The voices of the characters in a video, as reference audios named after them, for a model that listens. */
export function createCharacterVoicesPlugin(): ConnectorPlugin<ParamsWithCharacterVoices> {
	return {
		name: "character-voices",
		dependencies: [
			speakerVoices(({ generationAttributes: attrs }) =>
				heardCharacters(attrs),
			),
		],
		beforeGenerate(params, ctx) {
			const voices = heardCharacters(params).flatMap((speaker) => {
				const voice = foundVoice(ctx, speaker);
				return voice?.audioUrl
					? [{ url: voice.audioUrl, durationSec: voice.durationSec, speaker }]
					: [];
			});
			return voices.length === 0
				? params
				: { ...params, referenceAudios: voices };
		},
	};
}
