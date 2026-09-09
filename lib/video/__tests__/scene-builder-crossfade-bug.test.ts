import { describe, expect, it } from "vitest";
import { toFrames } from "../frames";
import { buildVideoLayout, MIN_DURATION_SEC } from "../scene-builder";
import { audioVolume } from "../audioVolume";
import { audioFadeSec } from "../audioFade";
import { volumeToGain } from "../elementAttributes";
import { AUDIO_FADE_SEC } from "../transitions";
import type { ResolvedElement, Sequence, VideoLayout } from "../types";

const FPS = 24;

function el(
	overrides: Partial<ResolvedElement> & {
		id: string;
		type: ResolvedElement["type"];
	},
): ResolvedElement {
	const roles: Record<string, ResolvedElement["role"]> = {
		image: "foreground",
		clip: "foreground",
		narration: "overlay",
		character: "overlay",
		music: "background",
		sound: "effect",
	};
	const layers: Record<string, ResolvedElement["layer"]> = {
		image: "visual",
		clip: "visual",
		narration: "audio",
		character: "audio",
		music: "audio",
		sound: "audio",
	};
	return {
		role: roles[overrides.type],
		layer: layers[overrides.type],
		sceneId: "s1",
		sceneNumber: 1,
		prompt: "",
		url: `https://example.com/${overrides.id}`,
		durationSec: 0,
		loops: 1,
		loop: false,
		volume: 10,
		motion: "none",
		...overrides,
	};
}

// A foreground anchor long enough that the looping effect copies are never trimmed
// by buildVideoLayout's total-duration clamp, so the seam is laid down verbatim.
function layoutForSound(element: ResolvedElement, anchorSec = 5): VideoLayout {
	return buildVideoLayout(
		[el({ id: "anchor", type: "clip", durationSec: anchorSec }), element],
		{ fps: FPS, trimVisualsToDialogue: false },
	);
}

function soundSeqs(layout: VideoLayout): Sequence[] {
	const s = layout.sequences.sound;
	expect(s).toBeDefined();
	return s as Sequence[];
}

// The window AudioSequence sizes its fade envelope against. Effects use the
// audio file's true length so the fade-out tail lands inside the audible region;
// backgrounds keep the per-copy <Sequence> window so their edge fades span the
// scene. Mirrors the role branch in VideoComposition.tsx.
function envelopeWindow(
	element: ResolvedElement,
	inflatedFrames: number,
	fps: number,
): number {
	return element.role === "effect"
		? toFrames(element.durationSec, fps)
		: inflatedFrames;
}

function envelope(element: ResolvedElement, windowFrames: number, fps: number) {
	const gain = volumeToGain(element.volume);
	const fadeFrames = toFrames(audioFadeSec(element), fps);
	return audioVolume(gain, windowFrames, fadeFrames);
}

// Per-frame volume sum across the seam where copy 0's tail overlaps copy 1's
// head: copy 0 at local frame f, copy 1 at local frame f - stride. A constant
// sum is the crossfade invariant the envelope is meant to hold.
function seamSums(
	vol: number | ((frame: number) => number),
	strideFrames: number,
	audioFrames: number,
): number[] | null {
	if (typeof vol !== "function") return null;
	const sums: number[] = [];
	for (let f = strideFrames; f < audioFrames; f++) {
		sums.push(vol(f) + vol(f - strideFrames));
	}
	return sums;
}

describe("crossfade seam for looping sub-1s sound effects", () => {
	describe("scene-builder inflates the per-copy window past the audio length", () => {
		it("clamps every sub-1s copy's seq.duration to MIN_DURATION_SEC", () => {
			const layout = layoutForSound(
				el({ id: "s1", type: "sound", durationSec: 0.5, loops: 2 }),
			);
			const sound = soundSeqs(layout);
			expect(sound).toHaveLength(2);
			expect(sound.every((s) => s.duration === MIN_DURATION_SEC)).toBe(true);
		});

		it("leaves the audio file shorter than the inflated per-copy window", () => {
			const layout = layoutForSound(
				el({ id: "s1", type: "sound", durationSec: 0.5, loops: 2 }),
			);
			const sound = soundSeqs(layout);
			expect(toFrames(sound[0].duration, FPS)).toBe(24);
			expect(toFrames(sound[0].element.durationSec, FPS)).toBe(12);
		});
	});

	describe("sizing the envelope to the audio file's true length holds a constant seam", () => {
		it.each([0.3, 0.4, 0.5, 0.7, 0.9] as const)(
			"across the sub-1s space (%ss, loops=2)",
			(durationSec) => {
				const layout = layoutForSound(
					el({ id: "s1", type: "sound", durationSec, loops: 2 }),
				);
				const sound = soundSeqs(layout);
				const strideFrames = toFrames(sound[1].start - sound[0].start, FPS);
				const audioFrames = toFrames(sound[0].element.durationSec, FPS);
				// The fix: effects crossfade against the audio file's true length.
				const window = envelopeWindow(
					sound[0].element,
					toFrames(sound[0].duration, FPS),
					FPS,
				);
				expect(window).toBe(audioFrames);
				const sums = seamSums(
					envelope(sound[0].element, window, FPS),
					strideFrames,
					audioFrames,
				);
				expect(sums).not.toBeNull();
				if (!sums) return;
				expect(sums.length).toBeGreaterThan(0);
				for (const sum of sums) expect(sum).toBeCloseTo(1.0, 5);
			},
		);
	});

	describe("non-regression for >=1s effects", () => {
		it.each([1.0, 1.5, 2.0] as const)(
			"is transparent when durationSec >= MIN_DURATION_SEC (%ss, loops=2)",
			(durationSec) => {
				const layout = layoutForSound(
					el({ id: "s1", type: "sound", durationSec, loops: 2 }),
				);
				const sound = soundSeqs(layout);
				const inflated = toFrames(sound[0].duration, FPS);
				// MIN_DURATION_SEC is a no-op here, so the fix's window equals the
				// inflated window and the seam is constant either way.
				expect(envelopeWindow(sound[0].element, inflated, FPS)).toBe(inflated);
				const strideFrames = toFrames(sound[1].start - sound[0].start, FPS);
				const audioFrames = toFrames(sound[0].element.durationSec, FPS);
				const sums = seamSums(
					envelope(sound[0].element, inflated, FPS),
					strideFrames,
					audioFrames,
				);
				expect(sums).not.toBeNull();
				if (!sums) return;
				expect(sums.length).toBeGreaterThan(0);
				for (const sum of sums) expect(sum).toBeCloseTo(1.0, 5);
			},
		);
	});

	describe("the role branch keeps non-effect audio untouched", () => {
		it("holds a one-shot effect at a constant scalar (no fade function)", () => {
			const element = el({
				id: "s1",
				type: "sound",
				durationSec: 0.5,
				loops: 1,
			});
			// audioFadeSec is 0 for a one-shot, so audioVolume returns the scalar
			// gain regardless of the window.
			const vol = envelope(
				element,
				envelopeWindow(element, toFrames(1, FPS), FPS),
				FPS,
			);
			expect(typeof vol).toBe("number");
			expect(vol).toBeCloseTo(volumeToGain(element.volume), 5);
		});

		it("keeps backgrounds on the inflated window so their edge fades span the scene", () => {
			const element = el({
				id: "m1",
				type: "music",
				durationSec: 4,
				loops: 2,
			});
			const inflated = toFrames(4, FPS);
			// The fix branches on role: backgrounds keep useVideoConfig().durationInFrames.
			expect(envelopeWindow(element, inflated, FPS)).toBe(inflated);
			expect(audioFadeSec(element)).toBe(AUDIO_FADE_SEC);
			const vol = envelope(element, inflated, FPS);
			expect(typeof vol).toBe("function");
			if (typeof vol !== "function") return;
			// Fade-in at the head and fade-out at the tail of the scene-spanning
			// window — the background edge-fade behaviour, preserved.
			expect(vol(0)).toBeCloseTo(0, 5);
			expect(vol(inflated)).toBeCloseTo(0, 5);
			expect(vol(toFrames(AUDIO_FADE_SEC, FPS))).toBeCloseTo(
				volumeToGain(element.volume),
				5,
			);
		});
	});
});
