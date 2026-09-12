/**
 * Pause any in-frame media so a seek doesn't leak audio from the old position.
 *
 * The composition renders shared audio tags that advance on their own media
 * clock, independently of the Player's frame driver, so they have to be
 * silenced explicitly around a seek.
 */
export function silenceMediaIn(node: HTMLElement | null) {
	if (!node) return;
	for (const el of node.querySelectorAll("audio, video")) {
		if (el instanceof HTMLMediaElement && !el.paused) el.pause();
	}
}
