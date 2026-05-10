import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { none } from "@remotion/transitions/none";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";

// zoomBlur and zoomInOut are excluded — both rely on the HTML-in-canvas API
// (chrome://flags/#canvas-draw-element), which isn't enabled in stable browsers.
export const TRANSITION_TYPES = [
	"none",
	"fade",
	"slide",
	"wipe",
	"flip",
	"clockWipe",
	"iris",
] as const;

export type TransitionType = (typeof TRANSITION_TYPES)[number];

export const DEFAULT_TRANSITION: TransitionType = "none";
export const TRANSITION_DURATION_SEC = 0.4;
export const AUDIO_FADE_SEC = 2;

type Dimensions = { width: number; height: number };

// Each presentation has its own prop type — TransitionPresentation is invariant
// in its generic, so we widen with `any` at the boundary.
export function getPresentation(
	name: TransitionType,
	{ width, height }: Dimensions,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): TransitionPresentation<any> {
	switch (name) {
		case "none":
			return none();
		case "fade":
			return fade();
		case "slide":
			return slide();
		case "wipe":
			return wipe();
		case "flip":
			return flip();
		case "clockWipe":
			return clockWipe({ width, height });
		case "iris":
			return iris({ width, height });
	}
}
