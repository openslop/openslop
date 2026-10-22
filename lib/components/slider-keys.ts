import { clamp } from "@/lib/utils";

const KEY_SEEK_SEC = 5;

/** How far one arrow key moves a seek slider, as a fraction of the track. */
export const seekKeyStep = (durationSec: number): number =>
	KEY_SEEK_SEC / durationSec;

/** Where a slider key moves the value, or null for a key the slider ignores. */
export function sliderKeyTarget(
	key: string,
	value: number,
	step: number,
): number | null {
	switch (key) {
		case "ArrowRight":
		case "ArrowUp":
			return clamp(value + step, 0, 1);
		case "ArrowLeft":
		case "ArrowDown":
			return clamp(value - step, 0, 1);
		case "Home":
			return 0;
		case "End":
			return 1;
		default:
			return null;
	}
}
