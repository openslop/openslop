import omit from "lodash/omit";
import pick from "lodash/pick";
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
			if (!ctx.searchVoices) {
				throw new Error(
					"voice-search plugin requires searchVoices in PluginContext",
				);
			}
			const voices = await ctx.searchVoices({
				...pick(params, VOICE_DESCRIPTOR_KEYS),
				language: params.language || "en",
			});
			if (!voices.length) throw new Error("No matching voice found");
			return { ...omit(params, VOICE_DESCRIPTOR_KEYS), voiceId: voices[0].id };
		},
	};
}
