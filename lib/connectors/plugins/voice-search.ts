import omit from "lodash/omit";
import type { ConnectorPlugin, TTSConnectorParams } from "../types";

const VOICE_DESCRIPTOR_KEYS = [
	"gender",
	"age",
	"pitch",
	"accent",
	"texture",
	"name",
	"query",
	"language",
] as const;

export function createVoiceSearchPlugin(): ConnectorPlugin<TTSConnectorParams> {
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
				texture: params.texture,
				language: params.language,
			});
			if (!voices.length) throw new Error("No matching voice found");
			return { ...omit(params, VOICE_DESCRIPTOR_KEYS), voiceId: voices[0].id };
		},
	};
}
