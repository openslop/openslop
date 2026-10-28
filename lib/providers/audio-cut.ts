import { AssetBundle } from "@/lib/api/asset-bundle";
import type { HostedVoicePreview } from "@/lib/connectors/types";
import { audioContainers, openAudio } from "./audio-containers";
import { type AudioBytes, audioOf, hostedAudio } from "./hosted-audio";

/** A copied cut can run over its mark by up to one frame. */
const FRAME_SEC = 0.05;

/** The first `seconds` of an audio file, in the container it came in. */
export async function trimAudio(
	bytes: ArrayBuffer,
	seconds: number,
): Promise<AudioBytes> {
	const mb = await import("mediabunny");
	const input = openAudio(mb, bytes);
	try {
		const format = await input.getFormat();
		const container = audioContainers(mb).find((c) => c.input === format);
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

/**
 * At most `seconds` of a hosted voice, cut once per length and kept in our store.
 * The voice comes from the request, so only one already in our store is fetched.
 */
export async function cutVoice(
	voice: HostedVoicePreview,
	seconds: number,
): Promise<HostedVoicePreview> {
	if (!AssetBundle.holds(voice.url))
		throw new Error(`Voice preview is not in our store: ${voice.url}`);
	if (seconds >= voice.durationSec - FRAME_SEC) return voice;
	return hostedAudio("voice-cut", `${voice.url}\n${seconds}`, async () => {
		const { data } = await audioOf(
			await fetch(voice.url),
			"Voice preview fetch failed",
		);
		return trimAudio(data, seconds);
	});
}
