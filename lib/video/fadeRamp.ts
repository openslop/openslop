export type FadeRamp = {
	input: readonly number[];
	output: readonly number[];
};

/**
 * Builds an input/output range for an audio fade-in/out envelope. Returns null
 * when the duration is too short to need any envelope (caller should hold at
 * full volume).
 *
 * Remotion's interpolate() requires strictly increasing input values, so when
 * the duration leaves no room for a plateau we collapse to a triangle peaking
 * at the midpoint instead of a trapezoid with equal adjacent values.
 */
export function fadeRamp(
	durationInFrames: number,
	fadeFrames: number,
): FadeRamp | null {
	if (durationInFrames <= 1 || fadeFrames <= 0) return null;
	const f = Math.min(fadeFrames, Math.floor((durationInFrames - 1) / 2));
	if (f <= 0) {
		return {
			input: [0, durationInFrames / 2, durationInFrames],
			output: [0, 1, 0],
		};
	}
	return {
		input: [0, f, durationInFrames - f, durationInFrames],
		output: [0, 1, 1, 0],
	};
}
