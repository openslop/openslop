import { describe, expect, it } from "vitest";
import { coverScale, motionTransform } from "../motion-effects";
import { isMotionEffect, MOTION_EFFECTS } from "../motion-effect-names";

const ACTIVE = MOTION_EFFECTS.filter((effect) => effect !== "none");

function parseTransform(transform: string) {
	const match =
		/^translate\(([-\d.]+)%,\s*([-\d.]+)%\)\s+scale\(([-\d.]+)\)\s+rotate\(([-\d.]+)deg\)$/.exec(
			transform,
		);
	if (!match) throw new Error(`unparseable transform: ${transform}`);
	return {
		tx: parseFloat(match[1]),
		ty: parseFloat(match[2]),
		scale: parseFloat(match[3]),
		rotation: parseFloat(match[4]),
	};
}

function sampleFrames(duration: number, count: number): number[] {
	return Array.from({ length: count }, (_, i) => (i * duration) / (count - 1));
}

describe("isMotionEffect", () => {
	it("accepts every known effect", () => {
		for (const effect of MOTION_EFFECTS)
			expect(isMotionEffect(effect)).toBe(true);
	});

	it("rejects unknown strings and non-strings", () => {
		expect(isMotionEffect("nope")).toBe(false);
		expect(isMotionEffect("")).toBe(false);
		expect(isMotionEffect(undefined)).toBe(false);
		expect(isMotionEffect(null)).toBe(false);
		expect(isMotionEffect(42)).toBe(false);
		expect(isMotionEffect({})).toBe(false);
	});
});

describe("coverScale", () => {
	it("returns 1 for a static, unrotated, untranslated layer", () => {
		expect(coverScale(0, 0, 0, 16 / 9)).toBe(1);
	});

	it("grows linearly with translate (2·max|t|/100)", () => {
		expect(coverScale(5, 0, 0, 16 / 9)).toBeCloseTo(1.1, 10);
		expect(coverScale(0, -5, 0, 16 / 9)).toBeCloseTo(1.1, 10);
		expect(coverScale(3, -4, 0, 16 / 9)).toBeCloseTo(1.08, 10);
	});

	it("grows with rotation, scaled by aspect ratio", () => {
		const a169 = coverScale(0, 0, 5, 16 / 9);
		const a11 = coverScale(0, 0, 5, 1);
		const a239 = coverScale(0, 0, 5, 2.39);
		expect(a169).toBeGreaterThan(a11);
		expect(a239).toBeGreaterThan(a169);
		// Exact formula: cos(θ) + AR·sin(θ)
		expect(a169).toBeCloseTo(
			Math.cos((5 * Math.PI) / 180) + (16 / 9) * Math.sin((5 * Math.PI) / 180),
			10,
		);
	});

	it("treats rotation sign symmetrically", () => {
		expect(coverScale(0, 0, 4, 16 / 9)).toBe(coverScale(0, 0, -4, 16 / 9));
	});
});

describe("motionTransform — 'none'", () => {
	it("returns identity sentinel regardless of frame / duration / AR", () => {
		expect(motionTransform("none", 0, 90)).toBe("none");
		expect(motionTransform("none", 45, 90)).toBe("none");
		expect(motionTransform("none", 0, 0, 1)).toBe("none");
		expect(motionTransform("none", 999, 90, 2.39)).toBe("none");
	});
});

describe("motionTransform — determinism and shape", () => {
	it("is pure: same inputs always produce the same output", () => {
		for (const effect of MOTION_EFFECTS) {
			expect(motionTransform(effect, 30, 90)).toBe(
				motionTransform(effect, 30, 90),
			);
			expect(motionTransform(effect, 30, 90, 9 / 16)).toBe(
				motionTransform(effect, 30, 90, 9 / 16),
			);
		}
	});

	it("active effects produce visible motion mid-duration (not identity)", () => {
		for (const effect of ACTIVE) {
			expect(motionTransform(effect, 45, 90)).not.toBe("none");
		}
	});
});

describe("motionTransform — ramped effects move from start to end", () => {
	it("pushIn zoom grows across the duration", () => {
		const start = parseTransform(motionTransform("pushIn", 0, 90));
		const end = parseTransform(motionTransform("pushIn", 90, 90));
		expect(end.scale).toBeGreaterThan(start.scale);
	});

	it("pullOut zoom shrinks across the duration", () => {
		const start = parseTransform(motionTransform("pullOut", 0, 90));
		const end = parseTransform(motionTransform("pullOut", 90, 90));
		expect(end.scale).toBeLessThan(start.scale);
	});

	it("panRight tx ramps from negative to positive", () => {
		const start = parseTransform(motionTransform("panRight", 0, 90));
		const end = parseTransform(motionTransform("panRight", 90, 90));
		expect(start.tx).toBeLessThan(0);
		expect(end.tx).toBeGreaterThan(0);
	});

	it("rotateSlow rotation ramps from 0 to its peak", () => {
		const start = parseTransform(motionTransform("rotateSlow", 0, 90));
		const end = parseTransform(motionTransform("rotateSlow", 90, 90));
		expect(Math.abs(start.rotation)).toBeLessThan(0.01);
		expect(end.rotation).toBeGreaterThan(start.rotation);
	});
});

describe("motionTransform — frame boundary handling", () => {
	it("clamps frames before 0 to the start value", () => {
		const startFrame = motionTransform("pushIn", 0, 90);
		const before = motionTransform("pushIn", -50, 90);
		expect(before).toBe(startFrame);
	});

	it("clamps frames past duration to the end value", () => {
		const endFrame = motionTransform("pushIn", 90, 90);
		const after = motionTransform("pushIn", 9999, 90);
		expect(after).toBe(endFrame);
	});

	it("tolerates zero/negative duration without throwing", () => {
		for (const effect of MOTION_EFFECTS) {
			expect(() => motionTransform(effect, 0, 0)).not.toThrow();
			expect(() => motionTransform(effect, 5, -10)).not.toThrow();
		}
	});

	it("clamps aspect ratio below 1 (caller mistake) to 1, so output stays finite", () => {
		const { scale } = parseTransform(
			motionTransform("rotateSlow", 90, 90, 0.5),
		);
		expect(Number.isFinite(scale)).toBe(true);
		expect(scale).toBeGreaterThan(0);
	});
});

describe("cover invariant — the geometric guarantee", () => {
	// Aspect ratios spanning every shape we plausibly render at:
	// square, landscape 16:9, portrait 9:16 (passed as h/w = 1.778), cinemascope 2.39.
	// All are normalised to ≥1 (longer/shorter) at the MotionLayer boundary.
	const ASPECTS: Array<{ label: string; ar: number }> = [
		{ label: "square 1:1", ar: 1 },
		{ label: "landscape 4:3", ar: 4 / 3 },
		{ label: "landscape 16:9", ar: 16 / 9 },
		{ label: "portrait 9:16 (normalised)", ar: 16 / 9 },
		{ label: "cinemascope 2.39:1", ar: 2.39 },
		{ label: "ultrawide 32:9", ar: 32 / 9 },
	];

	const DURATION = 90;
	const FRAMES = sampleFrames(DURATION, 31);

	for (const { label, ar } of ASPECTS) {
		for (const effect of ACTIVE) {
			it(`'${effect}' covers frame at AR ${label}`, () => {
				for (const frame of FRAMES) {
					const { tx, ty, scale, rotation } = parseTransform(
						motionTransform(effect, frame, DURATION, ar),
					);
					const min = coverScale(tx, ty, rotation, ar);
					expect(
						scale,
						`effect=${effect} ar=${ar} frame=${frame} tx=${tx} ty=${ty} rotation=${rotation} needs scale≥${min.toFixed(4)} got scale=${scale}`,
					).toBeGreaterThanOrEqual(min);
				}
			});
		}
	}

	it("scale grows with aspect ratio for rotation-heavy effects", () => {
		const square = parseTransform(motionTransform("rotateSlow", 90, 90, 1));
		const ultra = parseTransform(motionTransform("rotateSlow", 90, 90, 32 / 9));
		expect(ultra.scale).toBeGreaterThan(square.scale);
	});

	it("scale is independent of aspect ratio for pure-translate effects", () => {
		const square = parseTransform(motionTransform("panLeft", 30, 90, 1));
		const wide = parseTransform(motionTransform("panLeft", 30, 90, 16 / 9));
		expect(square.scale).toBeCloseTo(wide.scale, 10);
	});
});
