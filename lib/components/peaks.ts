import { memoAsync } from "@/lib/memoAsync";

const PEAK_COUNT = 200;

let sharedAudioContext: AudioContext | null = null;
const getAudioContext = () => (sharedAudioContext ??= new AudioContext());

/**
 * Normalized amplitudes (0–1) from raw audio samples, one per bucket.
 *
 * RMS rather than the bucket's loudest sample: peak-picking turns a single
 * transient into a full-height spike once the buckets are drawn as an envelope.
 */
export function extractPeaks(data: Float32Array, count: number): number[] {
	const step = Math.floor(data.length / count);
	if (step === 0) return [];
	const peaks = Array.from({ length: count }, (_, bucket) => {
		const samples = data.subarray(bucket * step, (bucket + 1) * step);
		const sumOfSquares = samples.reduce(
			(sum, sample) => sum + sample * sample,
			0,
		);
		return Math.sqrt(sumOfSquares / step);
	});
	const max = peaks.reduce((loudest, peak) => Math.max(loudest, peak), 0);
	return max > 0 ? peaks.map((peak) => peak / max) : peaks;
}

/** Asset URLs are immutable, so a source is decoded once. */
export const loadPeaks = memoAsync(decodePeaks, (src) => src);

async function decodePeaks(src: string): Promise<number[]> {
	const response = await fetch(src, { mode: "cors" });
	if (!response.ok) {
		throw new Error(`Failed to fetch audio: ${response.status}`);
	}
	const audio = await getAudioContext().decodeAudioData(
		await response.arrayBuffer(),
	);
	return extractPeaks(audio.getChannelData(0), PEAK_COUNT);
}
