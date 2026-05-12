import { interpolate } from "remotion";
import { fadeRamp } from "./fadeRamp";

/**
 * Resolves an audio element's volume to either a constant scalar or a
 * per-frame function that bakes in a fade envelope. Returning a scalar when
 * possible lets Remotion skip per-frame evaluation.
 */
export function audioVolume(
	multiplier: number,
	durationInFrames: number,
	fadeFrames: number,
): number | ((frame: number) => number) {
	const ramp = fadeRamp(durationInFrames, fadeFrames);
	if (!ramp) return multiplier;
	return (frame: number) =>
		interpolate(frame, ramp.input, ramp.output, {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}) * multiplier;
}
