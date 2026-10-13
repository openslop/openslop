import compact from "lodash/compact";
import { type Pictured, pictured } from "@/lib/connectors/characters";
import type { Character } from "@/lib/connectors/types";
import { cutVoice, secondsCap } from "../audio-cut";
import { type Conditioner, inputsOf } from "./conditioning";

type Voiced = Character & { voice: NonNullable<Character["voice"]> };

const voiced = (characters: Character[]): Voiced[] =>
	characters.filter((character): character is Voiced =>
		Boolean(character.voice),
	);

type Limits = {
	maxReferences: number;
	maxAudios: number;
	minAudioSec: number;
	totalAudioSec: number;
	voicesNeedPictures: boolean;
};

const audibleSpeakers = async (
	speakers: Voiced[],
	{ maxAudios, minAudioSec, totalAudioSec }: Limits,
): Promise<Voiced[]> => {
	const heard = speakers
		.filter(({ voice }) => voice.durationSec >= minAudioSec)
		.slice(0, maxAudios);
	const cap = secondsCap(
		heard.map(({ voice }) => voice.durationSec),
		totalAudioSec,
	);
	return Promise.all(
		heard.map(async (speaker) => ({
			...speaker,
			voice: await cutVoice(speaker.voice, cap),
		})),
	);
};

const avatarCue = ({ name }: Pictured, index: number) =>
	`@Image${index + 1} is ${name}.`;

const frameCue = (number: number) => `@Image${number} as the first frame.`;

const voiceCue = ({ name }: Voiced, index: number) =>
	`@Audio${index + 1} defines ${name}'s vocal timbre, pitch, and speech cadence.`;

export const seedance =
	(limits: Limits): Conditioner =>
	async ({
		prompt,
		startFrame,
		characters,
		references,
		continuityFrames,
		size,
	}) => {
		const slots = startFrame ? limits.maxReferences - 1 : limits.maxReferences;
		const cast = pictured(characters).slice(0, slots);
		const pictures = [
			...cast.map(({ avatarUrl }) => avatarUrl),
			...references,
			...continuityFrames,
		].slice(0, slots);
		const referenceImages = startFrame ? [...pictures, startFrame] : pictures;
		const speakers =
			limits.voicesNeedPictures && referenceImages.length === 0
				? []
				: voiced(characters);
		const heard = await audibleSpeakers(speakers, limits);
		const cues = compact([
			...cast.map(avatarCue),
			startFrame && frameCue(referenceImages.length),
			...heard.map(voiceCue),
		]);
		return {
			positivePrompt: [...cues, prompt].join(" "),
			...inputsOf({
				referenceImages,
				referenceAudios: heard.map(({ voice }) => voice.url),
			}),
			...size,
		};
	};
