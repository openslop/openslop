import { describe, expect, it } from "vitest";
import {
	audioEnvelopeFrames,
	audioFadeSec,
	LOOP_CROSSFADE_SEC,
	loopCrossfadeSec,
	loopStrideSec,
} from "../audioFade";
import { audioVolume } from "../audioVolume";
import { toFrames } from "../frames";
import { AUDIO_FADE_SEC } from "../transitions";
import type { ResolvedElement } from "../types";

function el(overrides: Partial<ResolvedElement>): ResolvedElement {
	return {
		id: "e1",
		type: "sound",
		role: "effect",
		layer: "audio",
		sceneId: "s1",
		sceneNumber: 1,
		prompt: "",
		url: "https://example.com/e1",
		durationSec: 4,
		loops: 1,
		loop: false,
		volume: 10,
		motion: "none",
		...overrides,
	};
}

describe("loopCrossfadeSec", () => {
	it("crossfades a looping effect", () => {
		expect(loopCrossfadeSec(el({ loops: 3 }))).toBe(LOOP_CROSSFADE_SEC);
	});

	it("leaves a one-shot alone", () => {
		expect(loopCrossfadeSec(el({ loops: 1 }))).toBe(0);
	});

	it("leaves looping audio that isn't an effect alone", () => {
		expect(
			loopCrossfadeSec(el({ type: "music", role: "background", loops: 4 })),
		).toBe(0);
	});

	it("never overlaps more than half a copy", () => {
		expect(loopCrossfadeSec(el({ loops: 3, durationSec: 0.1 }))).toBe(0.05);
	});
});

describe("loopStrideSec", () => {
	it("pulls each copy of a loop back by the crossfade", () => {
		expect(loopStrideSec(el({ loops: 3 }))).toBeCloseTo(
			4 - LOOP_CROSSFADE_SEC,
			5,
		);
	});

	it("is the full clip when nothing crossfades", () => {
		expect(loopStrideSec(el({ loops: 1 }))).toBe(4);
	});
});

describe("audioFadeSec", () => {
	it("eases a background bed in and out at its own edges", () => {
		expect(
			audioFadeSec(el({ type: "music", role: "background", loops: 4 })),
		).toBe(AUDIO_FADE_SEC);
	});

	it("fades a looping effect across its seam", () => {
		expect(audioFadeSec(el({ loops: 3 }))).toBe(LOOP_CROSSFADE_SEC);
	});

	it("holds a one-shot effect and narration at full volume", () => {
		expect(audioFadeSec(el({ loops: 1 }))).toBe(0);
		expect(audioFadeSec(el({ type: "narration", role: "overlay" }))).toBe(0);
	});
});

describe("audioEnvelopeFrames", () => {
	it("spans the audio file when the sequence window outlasts it", () => {
		expect(audioEnvelopeFrames(el({ durationSec: 0.5 }), 24, 24)).toBe(12);
	});

	it("spans the sequence window when the audio outlasts it", () => {
		expect(audioEnvelopeFrames(el({ durationSec: 4 }), 48, 24)).toBe(48);
	});

	it("sums a looping effect's copies to a constant across the seam", () => {
		const fps = 24;
		const element = el({ durationSec: 0.5, loops: 2 });
		const window = audioEnvelopeFrames(element, toFrames(1, fps), fps);
		const volume = audioVolume(1, window, toFrames(audioFadeSec(element), fps));
		if (typeof volume !== "function") throw new Error("Expected function");
		const stride = toFrames(loopStrideSec(element), fps);
		for (let f = stride; f < window; f++) {
			expect(volume(f) + volume(f - stride)).toBeCloseTo(1, 5);
		}
	});
});
