import pick from "lodash/pick";
import { findAsset, NARRATOR, voiceFrom, voiceOf } from "@/lib/canvas/assets";
import type { BuildContext } from "@/lib/generation/graph";
import { reading } from "@/lib/generation/dependency";
import { declaredLanguage } from "@/lib/project/language";
import { VoiceSchema, VOICE_TRAITS, type Voice } from "@/lib/project/types";
import { createConnector } from "../factory";
import { resolveModel } from "../models";
import type { AssetWrite, ModelPick, ModelRef, PluginContext } from "../types";
import { DEFAULT_TTS_LANGUAGE } from "./enums";

const CHOSEN_VOICE_KEYS = ["provider", "model", "voiceId"] as const;

/** The voice a speaker has chosen, recorded so choosing another stales whoever speaks in it. */
export const speakerVoice = (name = NARRATOR) => {
	const voice = reading(`${name}'s voice`, (_, { canvas }) => {
		const asset = findAsset(canvas, "asset_voice", name);
		return asset && JSON.stringify(pick(voiceFrom(asset), CHOSEN_VOICE_KEYS));
	});
	return {
		reads: voice.reads,
		value: (ctx: PluginContext): Voice =>
			VoiceSchema.parse(JSON.parse(voice.value(ctx) ?? "{}")),
	};
};

/** Speech speaks on the pair its voice was found on, else on `fallback`. */
export const voiceModel = (
	canvas: readonly unknown[],
	name = NARRATOR,
	fallback?: ModelPick,
): ModelRef => resolveModel("tts", voiceOf(canvas, name), fallback);

/** Searches by the voice's traits when it has no voice on its model, in the project's language when it declares one; a speaker with no voice is given one. */
export async function settleVoice(
	name = NARRATOR,
	{ canvas, state }: BuildContext,
	fallback?: ModelPick,
): Promise<AssetWrite[]> {
	const voice = voiceOf(canvas, name);
	const model = voiceModel(canvas, name, fallback);
	if (
		voice.voiceId &&
		voice.provider === model.provider &&
		voice.model === model.model
	)
		return [];
	const [found] = await createConnector("tts", model).searchVoices({
		...pick(voice, VOICE_TRAITS),
		language:
			declaredLanguage(state.scriptSettings.language) ??
			voice.language ??
			DEFAULT_TTS_LANGUAGE,
	});
	if (!found) throw new Error("No matching voice found");
	return [
		{ type: "asset_voice", name, attrs: { ...model, voiceId: found.id } },
	];
}
