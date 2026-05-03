import type { ConnectorPlugin, TTSGenerateParams } from "../types";

const VOICE_DESCRIPTOR_KEYS = new Set<string>([
	"gender",
	"age",
	"pitch",
	"accent",
	"description",
	"name",
	"query",
	"language",
]);

export function createVoiceSearchPlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "voice-search",
		async beforeGenerate(params, ctx) {
			if (params.voiceId) return params;
			if (!ctx?.searchVoices) {
				throw new Error(
					"voice-search plugin requires searchVoices in PluginContext",
				);
			}
			const voices = await ctx.searchVoices({
				query: params.query,
				gender: params.gender,
				age: params.age,
				pitch: params.pitch,
				accent: params.accent,
				description: params.description,
				language: params.language || "en",
			});
			if (!voices.length) throw new Error("No matching voice found");
			const filtered: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(params)) {
				if (!VOICE_DESCRIPTOR_KEYS.has(key)) filtered[key] = value;
			}
			return { ...(filtered as TTSGenerateParams), voiceId: voices[0].id };
		},
	};
}
