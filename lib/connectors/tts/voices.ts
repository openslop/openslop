import pick from "lodash/pick";
import { findAsset, voiceFrom, voiceOf } from "@/lib/canvas/assets";
import type { CanvasElement } from "@/lib/canvas/types";
import type { Read } from "@/lib/generation/declare";
import type { BuildContext } from "@/lib/generation/graph";
import { declaredLanguage } from "@/lib/project/language";
import { VoiceSchema, VOICE_TRAITS, type Voice } from "@/lib/project/types";
import { createConnector } from "../factory";
import { hasModel, resolveModel } from "../models";
import type { AssetWrite, ModelPick, PluginContext } from "../types";
import { DEFAULT_TTS_LANGUAGE } from "./enums";

const CHOSEN_VOICE_KEYS = ["provider", "model", "voiceId"] as const;

const voiceLabel = (name: string) => `${name}'s voice`;

/** The voices the speakers have chosen, recorded so choosing another stales whoever speaks in them. */
export const chosenVoices =
	(speakers: (element: CanvasElement) => string[]): Read =>
	(element, { canvas }) =>
		Object.fromEntries(
			speakers(element).map((name) => {
				const asset = findAsset(canvas, "asset_voice", name);
				return [
					voiceLabel(name),
					asset && JSON.stringify(pick(voiceFrom(asset), CHOSEN_VOICE_KEYS)),
				];
			}),
		);

export const recordedVoice = (ctx: PluginContext, name: string): Voice =>
	VoiceSchema.parse(JSON.parse(ctx.reads?.[voiceLabel(name)] ?? "{}"));

/** Searches by the voice's traits when it has no voice on a model of its own, in the project's language when it declares one. */
export async function settleVoice(
	name: string,
	{ canvas, state }: BuildContext,
	fallback?: ModelPick,
): Promise<AssetWrite[]> {
	const voice = voiceOf(canvas, name);
	if (voice.voiceId && hasModel("tts", voice)) return [];
	const model = resolveModel("tts", voice, fallback);
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
