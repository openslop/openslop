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

const decoded = new Map<string, Promise<number[]>>();

/**
 * Fetch and decode an audio file into normalized peaks. Asset URLs are
 * immutable, so a source is decoded once; a failure is dropped so it retries.
 */
export function loadPeaks(src: string): Promise<number[]> {
	const existing = decoded.get(src);
	if (existing) return existing;
	const pending = decodePeaks(src).catch((error) => {
		decoded.delete(src);
		throw error;
	});
	decoded.set(src, pending);
	return pending;
}

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
