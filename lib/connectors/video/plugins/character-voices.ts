import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
} from "@/lib/canvas/characterNames";
import { createConnector } from "@/lib/connectors/factory";
import { modelEntry, resolveModel } from "@/lib/connectors/models";
import { settleVoice, speakerVoice } from "@/lib/connectors/tts/voices";
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
		reads: (element, ctx) =>
			Object.assign(
				{},
				...heardCharacters(element.generationAttributes).map((name) =>
					speakerVoice(name).reads(element, ctx),
				),
			),
		async prepare(element, ctx) {
			const writes = await Promise.all(
				heardCharacters(element.generationAttributes).map((name) =>
					settleVoice(name, ctx),
				),
			);
			return writes.flat();
		},
		async beforeGenerate(params, ctx) {
			const voices = compact(
				await Promise.all(
					heardCharacters(params).map(async (name) => {
						const voice = speakerVoice(name).value(ctx);
						if (!voice.voiceId) return undefined;
						const preview = await createConnector(
							"tts",
							resolveModel("tts", voice),
						).voicePreview(voice.voiceId);
						return preview && { ...preview, speaker: name };
					}),
				),
			);
			return voices.length === 0
				? params
				: { ...params, referenceAudios: voices };
		},
	};
}
