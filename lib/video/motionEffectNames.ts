/**
 * The motion vocabulary, kept free of Remotion so it can be read anywhere the
 * names matter (element attributes, Sloppy's tool descriptions) without pulling
 * the renderer into that bundle.
 */
export const MOTION_EFFECTS = [
	"none",
	"kenBurnsIn",
	"kenBurnsOut",
	"pushIn",
	"pullOut",
	"panLeft",
	"panRight",
	"tiltUp",
	"tiltDown",
	"handheldDrift",
	"shake",
	"pulse",
	"rotateSlow",
] as const;

export type MotionEffect = (typeof MOTION_EFFECTS)[number];
export type ActiveMotionEffect = Exclude<MotionEffect, "none">;
