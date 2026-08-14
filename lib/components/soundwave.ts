import type { CSSProperties } from "react";

export const AUDIO_SAMPLE_COUNT = 120;

/** Pairs with {@link buildSoundwaveMask}: stretches the mask over the element. */
export const SOUNDWAVE_MASK_STYLE: CSSProperties = {
	maskSize: "100% 100%",
	WebkitMaskSize: "100% 100%",
	maskRepeat: "no-repeat",
	WebkitMaskRepeat: "no-repeat",
};

/** Silence still draws a hairline, so an empty stretch reads as audio, not a gap. */
const MIN_HEIGHT = 4;

/** A single loud bucket otherwise draws as a spike the ear never hears. */
function smooth(values: number[]): number[] {
	return values.map((value, i) => {
		const before = values[i - 1] ?? value;
		const after = values[i + 1] ?? value;
		return (before + value + after) / 3;
	});
}

/** Resamples normalized peaks (0–1) to `count` smoothed heights (0–100). */
export function toBarHeights(peaks: number[], count: number): number[] {
	if (peaks.length === 0) return [];
	const sampled = Array.from(
		{ length: count },
		(_, i) => peaks[Math.floor((i * peaks.length) / count)] * 100,
	);
	return smooth(sampled).map((height) => Math.max(MIN_HEIGHT, height));
}

/**
 * The waveform's envelope: heights (0–100) mirrored around the centreline into
 * one filled shape. A mask rather than a canvas, so it paints with a CSS
 * background colour and stays on the same theme tokens as the rest of the UI.
 */
export function buildSoundwaveMask(heights: number[]) {
	// A lone height has no span to draw across, so it becomes a flat band.
	const samples = heights.length === 1 ? [heights[0], heights[0]] : heights;
	const step = samples.length > 1 ? 100 / (samples.length - 1) : 0;
	const at = (i: number) => (i * step).toFixed(2);
	const top = samples.map((h, i) => `${at(i)},${((100 - h) / 2).toFixed(2)}`);
	const bottom = samples
		.map((h, i) => `${at(i)},${((100 + h) / 2).toFixed(2)}`)
		.reverse();
	const points = [...top, ...bottom].join(" ");
	return `url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${points}" fill="white"/></svg>`,
	)}")`;
}
