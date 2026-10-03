import pick from "lodash/pick";
import { findAsset, projectSettings, voiceOf } from "@/lib/canvas/assets";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
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

const voiceLabel = (name?: string) => `${name ?? "the narrator"}'s voice`;

const CHOSEN_VOICE_KEYS = ["provider", "model", "voiceId"] as const;

/** The voice a speaker has chosen, recorded so choosing another stales whoever speaks in it. */
export const speakerVoice = (name?: string) => {
	const voice = reading(voiceLabel(name), (_, { canvas }) => {
		const element = findAsset(canvas, "voice", name);
		return (
			element &&
			JSON.stringify(pick(flatAttributes(element), CHOSEN_VOICE_KEYS))
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

/** Searches by the voice's filters when it has no voice on `model`, and settles the find onto it. */
export async function settleVoice(
	name: string | undefined,
	model: ModelRef,
	canvas: readonly unknown[],
): Promise<AssetWrite[]> {
	const voice = voiceOf(canvas, name);
	if (
		voice.voiceId &&
		voice.provider === model.provider &&
		voice.model === model.model
	)
		return [];
	const voiceId = await findVoice(
		model,
		voice,
		projectSettings(canvas).language,
	);
	return [{ type: "voice", name, attrs: { ...model, voiceId } }];
}
