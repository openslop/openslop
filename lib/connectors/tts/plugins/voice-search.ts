import omit from "lodash/omit";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

// Search inputs consumed when resolving a voice. `name` is intentionally
// excluded — it's the identifier of the character target that downstream
// plugins (voice-hydrate) need to write the resolved voiceId back to the
// correct slot in metadata.
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
			return { ...omit(params, VOICE_DESCRIPTOR_KEYS), voiceId: voices[0].id };
		},
	};
}
