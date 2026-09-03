import { requireModel } from "@/lib/connectors/plugins";
import type { ProjectStore } from "@/lib/project/store";
import { metadataVoiceFor, voiceIdOn, voiceOnModel } from "@/lib/project/types";
import type {
	ConnectorPlugin,
	TTSGenerateParams,
} from "@/lib/connectors/types";

/**
 * Persists the voiceId resolved by voice-search back to the project store as
 * `resolvedVoiceId` so subsequent generations skip the search. Writes to the
 * matching character (when `params.name` is set) or to narration.
 */
export function createVoiceHydratePlugin(
	store: ProjectStore,
): ConnectorPlugin<TTSGenerateParams> {
	return {
		name: "voice-hydrate",
		beforeGenerate(params, ctx) {
			const { voiceId, name } = params;
			if (!voiceId) return params;
			const model = requireModel(ctx, "voice-hydrate");
			const { metadata, updateCharacter, setNarration } = store.getState();
			const voice = metadataVoiceFor(metadata, name);
			if (!voice || voiceIdOn(voice, model) === voiceId) return params;
			const next = { ...voiceOnModel(voice, model), resolvedVoiceId: voiceId };
			if (name) updateCharacter(name, next);
			else setNarration(next);
			return params;
		},
	};
}
