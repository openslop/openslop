import compact from "lodash/compact";
import { nanoid } from "nanoid";
import { renderCharacterRefs, seats } from "@/lib/connectors/character-refs";
import { type Pictured, pictured } from "@/lib/connectors/characters";
import type { TTSLanguage } from "@/lib/connectors/tts/enums";
import type { HostedVoicePreview } from "@/lib/connectors/types";
import { cutVoice } from "../audio-cut";
import { type Conditioner, inputsOf } from "./conditioning";

export const klingTurbo: Conditioner = ({
	prompt,
	startFrame,
	size,
	resolution,
}) => ({
	positivePrompt: renderCharacterRefs(prompt),
	...inputsOf({ frameImages: compact([startFrame]) }),
	...(startFrame && resolution ? { resolution } : size),
});

type OmniLimits = {
	maxReferences: number;
	maxElementsWithFrame: number;
	minVoiceSec: number;
	maxVoiceSec: number;
	voiceLanguages: readonly TTSLanguage[];
	maxDescription: number;
	sound: boolean;
};

// Omni fails the whole request on a voice outside the languages it speaks.
const speakable = (
	{ durationSec, language }: HostedVoicePreview,
	limits: OmniLimits,
) =>
	durationSec >= limits.minVoiceSec &&
	language !== undefined &&
	limits.voiceLanguages.includes(language);

const omniElement = async (
	{ name, avatarUrl, voice }: Pictured,
	limits: OmniLimits,
) => {
	const heard =
		voice && speakable(voice, limits)
			? await cutVoice(voice, limits.maxVoiceSec)
			: undefined;
	return {
		// Runware keeps elements by id across requests, so each request makes its own.
		id: nanoid(20),
		description: name.slice(0, limits.maxDescription),
		frontalImage: avatarUrl,
		images: [avatarUrl],
		...(heard && { voices: [heard.url] }),
	};
};

const elementRef = (seat: number) => `<<<element_${seat}>>>`;

const budgetOf = (startFrame: string | undefined, limits: OmniLimits) =>
	startFrame
		? { slots: limits.maxReferences - 1, elements: limits.maxElementsWithFrame }
		: { slots: limits.maxReferences, elements: limits.maxReferences };

export const klingOmni =
	(limits: OmniLimits): Conditioner =>
	async ({
		prompt,
		startFrame,
		characters,
		references,
		continuityFrames,
		size,
	}) => {
		const budget = budgetOf(startFrame, limits);
		const shown = pictured(characters);
		const seated = shown.slice(0, budget.elements);
		const overflowAvatars = shown
			.slice(seated.length)
			.map(({ avatarUrl }) => avatarUrl);
		return {
			positivePrompt: renderCharacterRefs(prompt, seats(seated, elementRef)),
			...inputsOf({
				frameImages: compact([startFrame]),
				elements: await Promise.all(
					seated.map((character) => omniElement(character, limits)),
				),
				referenceImages: [
					...continuityFrames,
					...overflowAvatars,
					...references,
				].slice(0, budget.slots - seated.length),
			}),
			providerSettings: { klingai: { sound: limits.sound } },
			...(startFrame ? {} : size),
		};
	};
