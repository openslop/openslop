import compact from "lodash/compact";
import {
	CHARACTERS_ATTR,
	parseCharacterNames,
} from "@/lib/canvas/characterNames";
import { modelEntry, resolveModel } from "@/lib/connectors/models";
import { requireContext } from "@/lib/connectors/plugins";
import type {
	ConnectorPlugin,
	PluginContext,
	ReferenceAudio,
} from "@/lib/connectors/types";
import type { DependencyDeclaration } from "@/lib/generation/dependency";
import { forVoice } from "@/lib/generation/sourceNodes";
import { metadataVoiceFor } from "@/lib/project/types";

export type ParamsWithCharacterVoices = {
	prompt: string;
	referenceAudios?: ReferenceAudio[];
	[CHARACTERS_ATTR]?: string;
};

/**
 * A character's voice is whatever their speech would speak with, so a
 * character with none yet gets one found and remembered here, as narration does.
 */
async function characterVoice(
	name: string,
	ctx: PluginContext,
): Promise<ReferenceAudio | undefined> {
	const state = requireContext(ctx, "state", "character-voices");
	const voice = metadataVoiceFor(state.metadata, name);
	if (!voice) return undefined;
	const speech = requireContext(ctx, "speech", "character-voices");
	const tts = speech(resolveModel("tts", voice));
	const voiceId = await tts.voiceFor(name, { state, signal: ctx.signal });
	if (!voiceId) return undefined;
	const hosted = await tts.voicePreview(voiceId);
	return hosted && { ...hosted, speaker: name };
}

/** Repicking a character's voice stales the video. */
export const characterVoices: DependencyDeclaration = {
	specs: (element) =>
		parseCharacterNames(element.generationAttributes?.[CHARACTERS_ATTR]).map(
			(name) => [`voice:${name}`, forVoice(name)] as const,
		),
};

/**
 * The voices of the characters in a video, as reference audios named after
 * them, for a model that listens.
 */
export function createCharacterVoicesPlugin(): ConnectorPlugin<ParamsWithCharacterVoices> {
	return {
		name: "character-voices",
		dependencies: [characterVoices],
		async beforeGenerate(params, ctx) {
			const names = parseCharacterNames(params[CHARACTERS_ATTR]);
			const model = requireContext(ctx, "model", "character-voices");
			if (names.length === 0 || !modelEntry("video", model).referenceAudios)
				return params;
			const voices = compact(
				await Promise.all(names.map((name) => characterVoice(name, ctx))),
			);
			return voices.length === 0
				? params
				: { ...params, referenceAudios: voices };
		},
	};
}
