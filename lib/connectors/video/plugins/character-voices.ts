import compact from "lodash/compact";
import { findAsset, voiceOf } from "@/lib/canvas/assets";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
	shownCharacters,
} from "@/lib/canvas/characterNames";
import { createConnector } from "@/lib/connectors/factory";
import { modelEntry, resolveModel } from "@/lib/connectors/models";
import { requireContext } from "@/lib/connectors/plugins";
import { settleVoice, speakerVoice } from "@/lib/connectors/tts/voices";
import type {
	ConnectorPlugin,
	ModelRef,
	PluginContext,
	ReferenceAudio,
} from "@/lib/connectors/types";

export type ParamsWithCharacterVoices = {
	prompt: string;
	referenceAudios?: ReferenceAudio[];
	[CHARACTERS_ATTR]?: string;
};

const listens = (model: ModelRef) =>
	Boolean(modelEntry("video", model).referenceAudios);

const voicedNames = (params: ParamsWithCharacterVoices, ctx: PluginContext) =>
	listens(requireContext(ctx, "model", "character-voices"))
		? parseCharacterNames(params[CHARACTERS_ATTR])
		: [];

/** The voices of the characters in a video, as reference audios named after them, for a model that listens. */
export function createCharacterVoicesPlugin(): ConnectorPlugin<ParamsWithCharacterVoices> {
	return {
		name: "character-voices",
		reads: (element, ctx) =>
			Object.assign(
				{},
				...shownCharacters(element).map((name) =>
					speakerVoice(name).reads(element, ctx),
				),
			),
		async prepare(element, { canvas }) {
			if (!listens(resolveModel("video", element.generationAttributes)))
				return [];
			const writes = await Promise.all(
				shownCharacters(element)
					.filter((name) => findAsset(canvas, "voice", name))
					.map((name) =>
						settleVoice(
							name,
							resolveModel("tts", voiceOf(canvas, name)),
							canvas,
						),
					),
			);
			return writes.flat();
		},
		async beforeGenerate(params, ctx) {
			const voices = compact(
				await Promise.all(
					voicedNames(params, ctx).map(async (name) => {
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
