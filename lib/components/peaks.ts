const PEAK_COUNT = 200;

let sharedAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
	if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
	return sharedAudioCtx;
};

/**
 * Normalized amplitudes (0–1) from raw audio samples, one per bucket.
 *
 * RMS rather than the bucket's loudest sample: peak-picking turns a single
 * transient into a full-height spike once the buckets are drawn as an envelope.
 */
export function extractPeaks(data: Float32Array, count: number): number[] {
	const step = Math.floor(data.length / count);
	if (step === 0) return [];
	const peaks: number[] = [];
	let max = 0;
	for (let i = 0; i < count; i++) {
		const offset = i * step;
		let sumOfSquares = 0;
		for (let j = 0; j < step; j++) {
			const sample = data[offset + j];
			sumOfSquares += sample * sample;
		}
		const rms = Math.sqrt(sumOfSquares / step);
		peaks.push(rms);
		if (rms > max) max = rms;
	}
	return max > 0 ? peaks.map((p) => p / max) : peaks;
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
	const audio = await getAudioCtx().decodeAudioData(
		await response.arrayBuffer(),
	);
	return extractPeaks(audio.getChannelData(0), PEAK_COUNT);
}
