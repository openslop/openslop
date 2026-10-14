import compact from "lodash/compact";
import { renderCharacterRefs, seats } from "@/lib/connectors/character-refs";
import { pictured, type Voiced, voiced } from "@/lib/connectors/characters";
import { cutVoice, secondsCap } from "../audio-cut";
import { type Conditioner, inputsOf } from "./conditioning";

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

const imageRef = (seat: number) => `@Image ${seat}`;

const frameCue = (seat: number) => `${imageRef(seat)} as the first frame.`;

const voiceCue =
	(refOf: (name: string) => string) =>
	({ name }: Voiced, index: number) =>
		`@Audio${index + 1} defines ${refOf(name)}'s vocal timbre, pitch, and speech cadence.`;

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
		const refOf = seats(cast, imageRef);
		const cues = compact([
			startFrame && frameCue(referenceImages.length),
			...heard.map(voiceCue(refOf)),
		]);
		return {
			positivePrompt: [...cues, renderCharacterRefs(prompt, refOf)].join(" "),
			...inputsOf({
				referenceImages,
				referenceAudios: heard.map(({ voice }) => voice.url),
			}),
			...size,
		};
	};
