import type { ProjectStore } from "@/lib/project/store";
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
		beforeGenerate(params) {
			if (!params.voiceId) return params;
			const { metadata, setCharacter, updateMetadata } = store.getState();
			if (params.name) {
				const character = metadata.characters[params.name];
				if (character && character.resolvedVoiceId !== params.voiceId) {
					setCharacter(params.name, {
						...character,
						resolvedVoiceId: params.voiceId,
					});
				}
			} else if (metadata.narration.resolvedVoiceId !== params.voiceId) {
				updateMetadata({ narration: { resolvedVoiceId: params.voiceId } });
			}
			return params;
		},
	};
}
