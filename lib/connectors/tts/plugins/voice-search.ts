import omit from "lodash/omit";
import { requireSearchVoices } from "@/lib/connectors/plugins";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

const VOICE_DESCRIPTOR_KEYS = [
	"gender",
	"age",
	"pitch",
	"accent",
	"description",
	"query",
	"language",
] as const;

export function createVoiceSearchPlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "voice-search",
		async beforeGenerate(params, ctx) {
			if (params.voiceId) return params;
			const searchVoices = requireSearchVoices(ctx, "voice-search");
			const voices = await searchVoices({
				query: params.query,
				gender: params.gender,
				age: params.age,
				pitch: params.pitch,
				accent: params.accent,
				description: params.description,
				language: params.language || "en",
			});
			if (!voices.length) throw new Error("No matching voice found");
			return { ...omit(params, VOICE_DESCRIPTOR_KEYS), voiceId: voices[0].id };
		},
	};
}
