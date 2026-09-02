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

const TRANSITION_LABELS: Record<TransitionType, string> = {
	none: "None",
	fade: "Fade",
	slide: "Slide",
	wipe: "Wipe",
	flip: "Flip",
	clockWipe: "Clock Wipe",
	iris: "Iris",
};

export const transitionLabel = (type: TransitionType): string =>
	TRANSITION_LABELS[type];

export const DEFAULT_TRANSITION: TransitionType = "none";
export const TRANSITION_DURATION_SEC = 0.4;
export const AUDIO_FADE_SEC = 2;
// Lead time to mount foreground video before it's visible so it decodes ahead
// of the transition and doesn't stall the Player (which would stutter audio).
export const VIDEO_PREMOUNT_SEC = 2;
