import type { HostedVoicePreview } from "@/lib/connectors/types";
import { type AudioBytes, audioOf, hostedAudio } from "./hosted-audio";

type Mediabunny = typeof import("mediabunny");

/** PCM is rewritten losslessly to the sample; the rest is copied a frame at a time. */
const containers = (mb: Mediabunny) => [
	{ input: mb.MP3, output: mb.Mp3OutputFormat },
	{ input: mb.WAVE, output: mb.WavOutputFormat, forceTranscode: true },
	{ input: mb.OGG, output: mb.OggOutputFormat },
	{ input: mb.FLAC, output: mb.FlacOutputFormat },
	{ input: mb.ADTS, output: mb.AdtsOutputFormat },
	{ input: mb.MP4, output: mb.Mp4OutputFormat },
];

/** A copied cut can run over its mark by up to one frame. */
const FRAME_SEC = 0.05;

/** The first `seconds` of an audio file, in the container it came in. */
export async function trimAudio(
	bytes: ArrayBuffer,
	seconds: number,
): Promise<AudioBytes> {
	const mb = await import("mediabunny");
	const known = containers(mb);
	const input = new mb.Input({
		source: new mb.BufferSource(bytes),
		formats: known.map(({ input }) => input),
	});
	try {
		const format = await input.getFormat();
		const container = known.find((c) => c.input === format);
		if (!container) throw new Error(`Cannot trim ${format.name} audio`);
		const target = new mb.BufferTarget();
		const output = new mb.Output({ format: new container.output(), target });
		const conversion = await mb.Conversion.init({
			input,
			output,
			trim: { start: 0, end: seconds },
			audio: { forceTranscode: container.forceTranscode },
		});
		await conversion.execute();
		if (!target.buffer) throw new Error("Trimming produced no audio");
		return { data: target.buffer, contentType: await output.getMimeType() };
	} finally {
		input.dispose();
	}
}

/**
 * The length every clip is held to so that together they fill `budget` at
 * most: clips that fit keep their length, the longer ones split what is left
 * evenly. Infinity when they all fit.
 */
export function secondsCap(durations: number[], budget: number): number {
	const ascending = [...durations].sort((a, b) => a - b);
	let left = budget;
	for (const [rank, seconds] of ascending.entries()) {
		const evenly = left / (ascending.length - rank);
		if (seconds > evenly) return evenly;
		left -= seconds;
	}
	return Infinity;
}

/** At most `seconds` of a hosted voice, cut once per length and kept in our store. */
export async function cutVoice(
	voice: HostedVoicePreview,
	seconds: number,
): Promise<HostedVoicePreview> {
	if (seconds >= voice.durationSec - FRAME_SEC) return voice;
	return hostedAudio("voice-cut", `${voice.url}\n${seconds}`, async () => {
		const { data } = await audioOf(
			await fetch(voice.url),
			"Voice preview fetch failed",
		);
		return trimAudio(data, seconds);
	});
}
