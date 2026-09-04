import { AUDIO_FADE_SEC } from "./transitions";
import type { ResolvedElement } from "./types";

/**
 * How long consecutive copies of a looping effect overlap. Butted end to end
 * they meet at a waveform discontinuity, which is audible as a click on every
 * repeat; overlapping them by a fade this long turns the seam into a crossfade.
 */
export const LOOP_CROSSFADE_SEC = 0.15;

/**
 * The overlap `element`'s loop copies share. Half a copy is the ceiling, past
 * which the copies would fade through each other end to end rather than at the
 * seam. One-shots and non-effect audio don't loop into anything, so they get none.
 */
export function loopCrossfadeSec(element: ResolvedElement): number {
	if (element.role !== "effect" || element.loops < 2) return 0;
	return Math.min(LOOP_CROSSFADE_SEC, element.durationSec / 2);
}

/** How far apart consecutive copies of `element` start. */
export function loopStrideSec(element: ResolvedElement): number {
	return element.durationSec - loopCrossfadeSec(element);
}

/**
 * The fade envelope a copy of `element` carries: a bed eases in and out at its
 * own edges, a looping effect fades across the overlap it shares with the next
 * copy so the two sum to a constant.
 */
export function audioFadeSec(element: ResolvedElement): number {
	return element.role === "background"
		? AUDIO_FADE_SEC
		: loopCrossfadeSec(element);
}
