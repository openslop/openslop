import compact from "lodash/compact";
import { nanoid } from "nanoid";
import { type Pictured, pictured } from "@/lib/connectors/characters";
import type { Character } from "@/lib/connectors/types";
import { cutVoice } from "../audio-cut";
import { type Conditioner, inputsOf } from "./conditioning";

export const klingTurbo: Conditioner = ({
	prompt,
	startFrame,
	size,
	resolution,
}) => ({
	positivePrompt: prompt,
	...inputsOf({ frameImages: compact([startFrame]) }),
	...(startFrame && resolution ? { resolution } : size),
});

type OmniLimits = {
	maxReferences: number;
	maxElementsWithFrame: number;
	minVoiceSec: number;
	maxVoiceSec: number;
	maxDescription: number;
	sound: boolean;
};

const element = async (
	{ name, avatarUrl, voice }: Pictured,
	limits: OmniLimits,
) => {
	const heard =
		voice && voice.durationSec >= limits.minVoiceSec
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

const elementCue = ({ name }: Character, index: number) =>
	`${name} is <<<element_${index + 1}>>>.`;

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
			positivePrompt: [...seated.map(elementCue), prompt].join(" "),
			...inputsOf({
				frameImages: compact([startFrame]),
				elements: await Promise.all(
					seated.map((character) => element(character, limits)),
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
