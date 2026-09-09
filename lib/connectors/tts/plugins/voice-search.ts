import omit from "lodash/omit";
import pick from "lodash/pick";
import { requireContext } from "@/lib/connectors/plugins";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { FALLBACK_LANGUAGE } from "@/lib/project/language";

const VOICE_DESCRIPTOR_KEYS = [
	"gender",
	"age",
	"pitch",
	"accent",
	"description",
	"query",
	"language",
] as const;

/** How a wanted voice is described: what a search matches on. */
export type VoiceDescriptor = Pick<
	VoiceSearchParams,
	(typeof VOICE_DESCRIPTOR_KEYS)[number]
>;

export function createVoiceSearchPlugin(): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "voice-search",
		async beforeGenerate(params, ctx) {
			if (params.voiceId) return params;
			const searchVoices = requireContext(ctx, "searchVoices", "voice-search");
			const voices = await searchVoices({
				...pick(params, VOICE_DESCRIPTOR_KEYS),
				language: params.language || FALLBACK_LANGUAGE,
			});
			if (!voices.length) throw new Error("No matching voice found");
			return { ...omit(params, VOICE_DESCRIPTOR_KEYS), voiceId: voices[0].id };
		},
	};
}
