import pick from "lodash/pick";
import {
	characterVoice,
	findAsset,
	NARRATOR,
	voiceAttrs,
	voiceOf,
} from "@/lib/canvas/assets";
import type { BuildContext } from "@/lib/generation/graph";
import { reading } from "@/lib/generation/dependency";
import { declaredLanguage, type LanguageChoice } from "@/lib/project/language";
import { VoiceSchema, VOICE_TRAITS, type Voice } from "@/lib/project/types";
import { createConnector } from "../factory";
import type {
	AssetWrite,
	ModelRef,
	PluginContext,
	VoiceSearchParams,
} from "../types";
import { DEFAULT_TTS_LANGUAGE } from "./enums";

export const VOICE_SEARCH_KEYS = [...VOICE_TRAITS, "query"] as const;

const voiceLabel = (name = NARRATOR) => `${name}'s voice`;

const CHOSEN_VOICE_KEYS = ["provider", "model", "voiceId"] as const;

/** The voice a speaker has chosen, recorded so choosing another stales whoever speaks in it. */
export const speakerVoice = (name = NARRATOR) => {
	const voice = reading(voiceLabel(name), (_, { canvas }) => {
		const character = findAsset(canvas, "asset_character", name);
		return (
			character &&
			JSON.stringify(pick(characterVoice(character), CHOSEN_VOICE_KEYS))
		);
	});
	return {
		reads: voice.reads,
		value: (ctx: PluginContext): Voice =>
			VoiceSchema.parse(JSON.parse(voice.value(ctx) ?? "{}")),
	};
};

/** The first voice on `model` that fits the traits, in the project's language when it declares one. */
async function findVoice(
	model: ModelRef,
	traits: VoiceSearchParams,
	choice: LanguageChoice,
): Promise<string> {
	const [found] = await createConnector("tts", model).searchVoices({
		...pick(traits, VOICE_SEARCH_KEYS),
		language:
			declaredLanguage(choice) ?? traits.language ?? DEFAULT_TTS_LANGUAGE,
	});
	if (!found) throw new Error("No matching voice found");
	return found.id;
}

/** Searches by the voice's filters when it has no voice on `model`; a speaker with no character is given one. */
export async function settleVoice(
	name = NARRATOR,
	model: ModelRef,
	{ canvas, state }: BuildContext,
): Promise<AssetWrite[]> {
	const { language } = state.settings;
	const voice = voiceOf(canvas, name);
	if (
		voice.voiceId &&
		voice.provider === model.provider &&
		voice.model === model.model
	)
		return [];
	const voiceId = await findVoice(model, voice, language);
	return [
		{ type: "asset_character", name, attrs: voiceAttrs({ ...model, voiceId }) },
	];
}
