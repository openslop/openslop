import pick from "lodash/pick";
import { resolveModel } from "@/lib/connectors/models";
import { declaredLanguage } from "@/lib/project/language";
import {
	metadataVoiceFor,
	VOICE_TRAITS,
	voiceIdOn,
	voiceOnModel,
	voiceTraitsSchema,
} from "@/lib/project/types";
import type {
	ModelRef,
	VoiceSearchFn,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import type { ProjectData, ProjectStore } from "@/lib/project/store";

export type Speaker = {
	name?: string;
	model: ModelRef;
	voiceId?: string;
	traits: VoiceSearchParams;
};

export const VOICE_SEARCH_KEYS = [...VOICE_TRAITS, "query"] as const;

export function speakerFor(
	metadata: ProjectData["metadata"],
	name: string | undefined,
	model?: ModelRef,
): Speaker | undefined {
	const voice = metadataVoiceFor(metadata, name);
	if (!voice) return undefined;
	model ??= resolveModel("tts", voice);
	const traits = voiceTraitsSchema.parse(voice);
	return {
		name,
		model,
		voiceId: voiceIdOn(voice, model),
		traits: {
			...traits,
			language: declaredLanguage(metadata.language) ?? traits.language,
		},
	};
}

export async function resolveVoiceId(
	speaker: Speaker,
	searchVoices: VoiceSearchFn,
	store: ProjectStore,
): Promise<string> {
	if (speaker.voiceId) return speaker.voiceId;
	const [found] = await searchVoices({
		...pick(speaker.traits, VOICE_SEARCH_KEYS),
		language: speaker.traits.language || "en",
	});
	if (!found) throw new Error("No matching voice found");
	setResolvedVoiceId(store, speaker, found.id);
	return found.id;
}

function setResolvedVoiceId(
	store: ProjectStore,
	{ name, model }: Speaker,
	voiceId: string,
) {
	const { metadata, updateCharacter, setNarration } = store.getState();
	const voice = metadataVoiceFor(metadata, name);
	if (!voice || voiceIdOn(voice, model) === voiceId) return;
	const next = { ...voiceOnModel(voice, model), resolvedVoiceId: voiceId };
	if (name) updateCharacter(name, next);
	else setNarration(next);
}
