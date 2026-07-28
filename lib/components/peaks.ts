const PEAK_COUNT = 200;

let sharedAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
	if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
	return sharedAudioCtx;
};

/** Extract normalized peak amplitudes (0–1) from raw audio samples. */
export function extractPeaks(data: Float32Array, count: number): number[] {
	const step = Math.floor(data.length / count);
	if (step === 0) return [];
	const peaks: number[] = [];
	let max = 0;
	for (let i = 0; i < count; i++) {
		let peak = 0;
		const offset = i * step;
		for (let j = 0; j < step; j++) {
			const v = Math.abs(data[offset + j]);
			if (v > peak) peak = v;
		}
		peaks.push(peak);
		if (peak > max) max = peak;
	}
	return max > 0 ? peaks.map((p) => p / max) : peaks;
}

/** Fetch and decode an audio file into normalized peaks for waveform rendering. */
export async function loadPeaks(src: string): Promise<number[]> {
	const response = await fetch(src, { mode: "cors" });
	if (!response.ok) {
		throw new Error(`Failed to fetch audio: ${response.status}`);
	}
	const audio = await getAudioCtx().decodeAudioData(
		await response.arrayBuffer(),
	);
	return extractPeaks(audio.getChannelData(0), PEAK_COUNT);
}
