import { Easing, interpolate } from "remotion";
import {
	MOTION_EFFECTS,
	type ActiveMotionEffect,
	type MotionEffect,
} from "./motionEffectNames";

export const DEFAULT_MOTION: MotionEffect = "none";

const MOTION_SET: ReadonlySet<string> = new Set(MOTION_EFFECTS);

export function isMotionEffect(value: unknown): value is MotionEffect {
	return typeof value === "string" && MOTION_SET.has(value);
}

/**
 * Per-frame motion components. `tx`/`ty` are percentages of the frame (CSS
 * `translate` semantics), `rotation` is in degrees, `extraScale` is *visible*
 * zoom added on top of the auto-computed cover-scale floor.
 */
type Components = {
	tx: number;
	ty: number;
	rotation: number;
	extraScale: number;
};

const ZERO: Components = { tx: 0, ty: 0, rotation: 0, extraScale: 0 };

const easeInOut = Easing.inOut(Easing.ease);

function ramp(frame: number, d: number, a: number, b: number): number {
	if (d <= 0) return b;
	return interpolate(frame, [0, d], [a, b], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: easeInOut,
	});
}

/**
 * Each non-"none" effect declares only the *motion intent*. The scale needed
 * to keep the element covering the frame is computed automatically from
 * `tx`/`ty`/`rotation` + the frame's aspect ratio, so an effect can never
 * accidentally reveal the boundary.
 */
const SPECS: Record<
	ActiveMotionEffect,
	(frame: number, d: number) => Components
> = {
	kenBurnsIn: (f, d) => ({
		tx: ramp(f, d, -3, 3),
		ty: ramp(f, d, -1.8, 1.8),
		rotation: 0,
		extraScale: ramp(f, d, 0, 0.1),
	}),
	kenBurnsOut: (f, d) => ({
		tx: ramp(f, d, 3, -3),
		ty: ramp(f, d, 1.8, -1.8),
		rotation: 0,
		extraScale: ramp(f, d, 0.1, 0),
	}),
	pushIn: (f, d) => ({ ...ZERO, extraScale: ramp(f, d, 0, 0.15) }),
	pullOut: (f, d) => ({ ...ZERO, extraScale: ramp(f, d, 0.15, 0) }),
	panLeft: (f, d) => ({ ...ZERO, tx: ramp(f, d, 4, -4) }),
	panRight: (f, d) => ({ ...ZERO, tx: ramp(f, d, -4, 4) }),
	tiltUp: (f, d) => ({ ...ZERO, ty: ramp(f, d, 4, -4) }),
	tiltDown: (f, d) => ({ ...ZERO, ty: ramp(f, d, -4, 4) }),
	handheldDrift: (f) => ({
		tx: Math.sin(f * 0.06) * 0.6 + Math.sin(f * 0.013) * 0.4,
		ty: Math.cos(f * 0.05) * 0.6 + Math.cos(f * 0.017) * 0.4,
		rotation: Math.sin(f * 0.04) * 0.4,
		extraScale: 0,
	}),
	shake: (f) => ({
		tx: Math.sin(f * 1.7) * 0.35 + Math.sin(f * 2.9) * 0.2,
		ty: Math.cos(f * 1.9) * 0.35 + Math.cos(f * 3.3) * 0.2,
		rotation: 0,
		extraScale: 0,
	}),
	pulse: (f) => ({
		...ZERO,
		extraScale: 0.03 + Math.sin(f * 0.18) * 0.025,
	}),
	rotateSlow: (f, d) => ({ ...ZERO, rotation: ramp(f, d, 0, 4) }),
};

/** Subpixel safety margin added on top of the geometric cover-scale floor. */
const COVER_HEADROOM = 0.005;

/**
 * Minimum scale at which an AbsoluteFill, after `translate(tx%, ty%)
 * rotate(θ)`, still fully covers a frame with the given longer/shorter aspect
 * ratio. AR must be ≥1 (i.e. the larger side over the smaller); MotionLayer
 * derives it from `useVideoConfig`.
 */
export function coverScale(
	tx: number,
	ty: number,
	rotation: number,
	aspectRatio: number,
): number {
	const rad = (Math.abs(rotation) * Math.PI) / 180;
	const rotationCover = Math.cos(rad) + aspectRatio * Math.sin(rad);
	const translateCover = (2 * Math.max(Math.abs(tx), Math.abs(ty))) / 100;
	return rotationCover + translateCover;
}

/**
 * Pure: returns the CSS `transform` value for `effect` at `frame`. The chosen
 * scale always covers the frame at the given aspect ratio (default 16:9),
 * regardless of the effect's translation or rotation.
 */
export function motionTransform(
	effect: MotionEffect,
	frame: number,
	durationInFrames: number,
	aspectRatio: number = 16 / 9,
): string {
	if (effect === "none") return "none";
	const d = Math.max(1, durationInFrames);
	const ar = Math.max(1, aspectRatio);
	const c = SPECS[effect](frame, d);
	const scale =
		coverScale(c.tx, c.ty, c.rotation, ar) + COVER_HEADROOM + c.extraScale;
	return `translate(${c.tx.toFixed(3)}%, ${c.ty.toFixed(3)}%) scale(${scale.toFixed(4)}) rotate(${c.rotation.toFixed(3)}deg)`;
}
