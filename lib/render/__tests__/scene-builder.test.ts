import { describe, expect, it } from "vitest";
import { toFrames } from "../frames";
import { isBlankScene } from "../blank-scene";
import { totalDuration } from "../sequences";
import type { BuildLayoutOptions } from "../scene-builder";
import type { ResolvedElement, Sequence, RenderLayout } from "../types";
import type { ContentType } from "@/lib/canvas/types";
import { layoutOf } from "./_layout";

// The rendered transition overlap: TRANSITION_DURATION_SEC (0.4s) snapped to the
// 24fps frame grid, which is what <TransitionSeries> actually lays down.
const OVERLAP = 10 / 24;
// LOOP_CROSSFADE_SEC (0.15s) on the same grid: how far each copy of a looping
// effect slides back so it overlaps the tail of the one before it.
const LOOP_OVERLAP = 4 / 24;

function seqs(layout: RenderLayout, type: ContentType): Sequence[] {
	const s = layout.sequences[type];
	expect(s).toBeDefined();
	return s as Sequence[];
}

function el(
	overrides: Partial<ResolvedElement> & {
		id: string;
		type: ResolvedElement["type"];
	},
): ResolvedElement {
	const roles: Record<string, ResolvedElement["role"]> = {
		image: "foreground",
		video: "foreground",
		narration: "overlay",
		character: "overlay",
		music: "background",
		sound: "effect",
	};
	const layers: Record<string, ResolvedElement["layer"]> = {
		image: "visual",
		video: "visual",
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
		trimDurationSec: 0,
		mediaDurationSec: 0,
		trimStartSec: 0,
		loops: 1,
		loop: false,
		volume: 10,
		motion: "none",
		...overrides,
	};
}

// A cut leaves scenes abutting; only a cross-fade overlaps them, so the layouts
// that assert the overlap ask for one.
const crossfaded = (
	elements: ResolvedElement[],
	options?: Partial<BuildLayoutOptions>,
): RenderLayout => layoutOf(elements, { transitionType: "fade", ...options });

describe("buildRenderLayout", () => {
	describe("empty input", () => {
		it("returns an empty layout with the minimum frame count", () => {
			const layout = layoutOf([]);
			expect(layout.series).toHaveLength(0);
			expect(layout.totalDurationSec).toBe(0);
			expect(layout.totalFrames).toBe(2);
		});
	});

	describe("film effects", () => {
		it("leaves them off unless asked", () => {
			expect(layoutOf([])).toMatchObject({
				filmGrain: false,
				rgbSplit: false,
			});
		});

		it("carries them to the composition", () => {
			expect(layoutOf([], { filmGrain: true, rgbSplit: true })).toMatchObject({
				filmGrain: true,
				rgbSplit: true,
			});
		});
	});

	describe("foreground elements (image, video)", () => {
		it("creates a series entry for a single foreground element", () => {
			const layout = layoutOf([
				el({ id: "img1", type: "image", trimDurationSec: 5 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(layout.series[0].element?.id).toBe("img1");
			expect(layout.series[0].start).toBe(0);
			expect(totalDuration(layout.series[0])).toBe(5);
			expect(layout.totalDurationSec).toBe(5);
		});

		it("plays consecutive foreground elements end-to-end", () => {
			const layout = crossfaded([
				el({ id: "img1", type: "image", trimDurationSec: 5 }),
				el({ id: "video1", type: "video", trimDurationSec: 3 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(layout.series[0].start).toBe(0);
			// Each foreground past the first overlaps the previous by one rendered
			// transition to match what <TransitionSeries> renders.
			expect(layout.series[1].start).toBeCloseTo(5 - OVERLAP, 5);
			expect(layout.totalDurationSec).toBeCloseTo(8 - OVERLAP, 5);
		});

		it("places overlays on the rendered timeline so they align with transitioned visuals", () => {
			const layout = crossfaded([
				el({ id: "img1", type: "image", trimDurationSec: 5 }),
				el({ id: "img2", type: "image", trimDurationSec: 3 }),
				el({ id: "n1", type: "narration", trimDurationSec: 2 }),
			]);
			expect(layout.series[1].start).toBeCloseTo(5 - OVERLAP, 5);
			expect(seqs(layout, "narration")[0].start).toBeCloseTo(5 - OVERLAP, 5);
			expect(layout.totalDurationSec).toBeCloseTo(8 - OVERLAP, 5);
		});

		it("lays a looping video down once; it repeats inside the scene it already has", () => {
			const looped = el({
				id: "video1",
				type: "video",
				trimDurationSec: 3,
				loop: true,
			});
			const layout = layoutOf([looped]);
			expect(layout.series).toHaveLength(1);
			expect(totalDuration(layout.series[0])).toBe(3);
			expect(layout.sequences.video).toBeUndefined();
		});

		it("clamps a foreground shorter than the minimum duration", () => {
			const layout = layoutOf([
				el({ id: "img1", type: "image", trimDurationSec: 0 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(layout.series[0].element?.id).toBe("img1");
			expect(totalDuration(layout.series[0])).toBe(1);
			expect(layout.totalDurationSec).toBe(1);
		});
	});

	describe("transition overlap", () => {
		it("overlaps consecutive scenes by the cross-fade", () => {
			const layout = crossfaded([
				el({ id: "img1", type: "image", trimDurationSec: 5 }),
				el({ id: "img2", type: "image", trimDurationSec: 3 }),
			]);
			expect(layout.transitionDurationSec).toBeCloseTo(OVERLAP, 5);
		});

		it("leaves scenes whole when they cut instead of cross-fading", () => {
			const layout = layoutOf(
				[
					el({ id: "img1", type: "image", trimDurationSec: 5 }),
					el({ id: "img2", type: "image", trimDurationSec: 3 }),
				],
				{ transitionType: "none" },
			);
			expect(layout.transitionDurationSec).toBe(0);
			expect(layout.series[1].start).toBe(5);
			expect(layout.totalDurationSec).toBe(8);
		});
	});

	describe("overlay elements (narration, character)", () => {
		it("opens a blank scene when no foreground precedes", () => {
			const layout = layoutOf([
				el({ id: "n1", type: "narration", trimDurationSec: 4 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(totalDuration(layout.series[0])).toBe(4);
		});

		it("collapses consecutive leading overlays into one blank scene", () => {
			const layout = layoutOf([
				el({ id: "n1", type: "narration", trimDurationSec: 3 }),
				el({ id: "n2", type: "narration", trimDurationSec: 4 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(totalDuration(layout.series[0])).toBe(7);
			expect(layout.series[0].minDuration).toBe(7);
			expect(seqs(layout, "narration")).toHaveLength(2);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "narration")[1].start).toBe(3);
		});

		it("extends the current series entry to fit a longer overlay", () => {
			const layout = layoutOf([
				el({ id: "video1", type: "video", trimDurationSec: 5 }),
				el({ id: "n1", type: "narration", trimDurationSec: 8 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(totalDuration(layout.series[0])).toBe(8);
			expect(seqs(layout, "narration")).toHaveLength(1);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "narration")[0])).toBe(8);
		});

		it("stacks consecutive overlays within the current series entry", () => {
			const layout = layoutOf([
				el({ id: "img1", type: "image", trimDurationSec: 0 }),
				el({ id: "n1", type: "narration", trimDurationSec: 5 }),
				el({ id: "c1", type: "character", trimDurationSec: 3 }),
			]);
			expect(totalDuration(layout.series[0])).toBe(8);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "character")[0].start).toBe(5);
		});

		it("holds each scene open for its overlays and the minimum, whether or not they decide the scene", () => {
			const layout = layoutOf([
				el({ id: "video1", type: "video", trimDurationSec: 10 }),
				el({ id: "n1", type: "narration", trimDurationSec: 3 }),
				el({ id: "c1", type: "character", trimDurationSec: 2 }),
				el({
					id: "video2",
					type: "video",
					trimDurationSec: 2,
					mediaDurationSec: 2,
				}),
				el({ id: "n2", type: "narration", trimDurationSec: 6 }),
				el({ id: "img1", type: "image", trimDurationSec: 4 }),
			]);
			expect(layout.series.map((scene) => scene.minDuration)).toEqual([
				5, 6, 1,
			]);
			expect(layout.series.map((scene) => scene.duration)).toEqual([10, 2, 4]);
			expect(layout.series.map(totalDuration)).toEqual([10, 6, 4]);
		});

		it("plays a foreground after the overlay that leads it", () => {
			const layout = crossfaded([
				el({ id: "n1", type: "narration", trimDurationSec: 9 }),
				el({ id: "img1", type: "image", trimDurationSec: 5 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(totalDuration(layout.series[0])).toBe(9);
			expect(layout.series[1].element.id).toBe("img1");
			expect(layout.series[1].start).toBeCloseTo(9 - OVERLAP, 5);
			expect(totalDuration(layout.series[1])).toBe(5);
			expect(seqs(layout, "narration")[0].start).toBe(0);
		});

		it("delays the next foreground when an overlay extends past it", () => {
			const layout = crossfaded([
				el({ id: "img1", type: "image", trimDurationSec: 5 }),
				el({ id: "n1", type: "narration", trimDurationSec: 9 }),
				el({ id: "video1", type: "video", trimDurationSec: 6 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(layout.series[1].element?.id).toBe("video1");
			expect(layout.series[1].start).toBeCloseTo(9 - OVERLAP, 5);
			expect(totalDuration(layout.series[1])).toBe(6);
		});

		it("starts the next foreground immediately when the overlay is shorter", () => {
			const layout = crossfaded([
				el({ id: "img1", type: "image", trimDurationSec: 30 }),
				el({ id: "n1", type: "narration", trimDurationSec: 9 }),
				el({ id: "video1", type: "video", trimDurationSec: 6 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(layout.series[1].element?.id).toBe("video1");
			expect(layout.series[1].start).toBeCloseTo(30 - OVERLAP, 5);
			expect(totalDuration(layout.series[1])).toBe(6);
		});

		it("stretches the blank scene over the overlays that open the video, before the first visual", () => {
			const layout = crossfaded([
				el({ id: "n1", type: "narration", trimDurationSec: 9 }),
				el({ id: "c1", type: "character", trimDurationSec: 3 }),
				el({ id: "img1", type: "image", trimDurationSec: 4 }),
				el({ id: "n2", type: "narration", trimDurationSec: 2 }),
				el({ id: "n3", type: "narration", trimDurationSec: 3 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(totalDuration(layout.series[0])).toBe(12);
			expect(layout.series[1].element.id).toBe("img1");
			expect(totalDuration(layout.series[1])).toBeCloseTo(5, 5);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "narration")[1].start).toBeCloseTo(12 - OVERLAP, 5);
			expect(seqs(layout, "narration")[2].start).toBeCloseTo(14 - OVERLAP, 5);
		});
	});

	describe("background elements (music)", () => {
		it("trims a background to the foreground duration", () => {
			const layout = layoutOf([
				el({ id: "m1", type: "music", trimDurationSec: 30 }),
				el({ id: "img1", type: "image", trimDurationSec: 10 }),
			]);
			expect(seqs(layout, "music")).toHaveLength(1);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "music")[0])).toBe(10);
		});

		it("drops a background placed after the last scene", () => {
			const layout = layoutOf([
				el({ id: "img1", type: "image", trimDurationSec: 10 }),
				el({ id: "m1", type: "music", trimDurationSec: 30 }),
			]);
			expect(seqs(layout, "music")).toHaveLength(0);
		});

		it("caps the previous background when a new background of the same type starts", () => {
			const layout = layoutOf([
				el({ id: "m1", type: "music", trimDurationSec: 30 }),
				el({ id: "img1", type: "image", trimDurationSec: 10 }),
				el({ id: "m2", type: "music", trimDurationSec: 20 }),
				el({ id: "img2", type: "image", trimDurationSec: 5 }),
			]);
			expect(seqs(layout, "music")).toHaveLength(2);
			expect(seqs(layout, "music")[0]).toMatchObject({
				duration: 10,
				maxDuration: 10,
			});
			expect(seqs(layout, "music")[1]).toMatchObject({
				start: 10,
				duration: 5,
				maxDuration: 5,
			});
		});

		it("leaves an earlier background untouched when it ends before its replacement", () => {
			const layout = crossfaded([
				el({ id: "m1", type: "music", trimDurationSec: 10 }),
				el({ id: "video1", type: "video", trimDurationSec: 10 }),
				el({ id: "c1", type: "character", trimDurationSec: 5 }),
				el({ id: "m2", type: "music", trimDurationSec: 20 }),
				el({ id: "c2", type: "character", trimDurationSec: 5 }),
				el({ id: "img1", type: "image", trimDurationSec: 6 }),
			]);
			expect(layout.totalDurationSec).toBeCloseTo(16 - OVERLAP, 5);
			expect(seqs(layout, "music")).toHaveLength(2);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "music")[0])).toBeCloseTo(
				10 - OVERLAP,
				5,
			);
			// m2 starts with img1's scene, one transition early.
			expect(seqs(layout, "music")[1].start).toBeCloseTo(10 - OVERLAP, 5);
			expect(totalDuration(seqs(layout, "music")[1])).toBeCloseTo(6, 5);
		});

		it("collapses consecutive backgrounds at the same offset to the latest", () => {
			const layout = crossfaded([
				el({ id: "m1", type: "music", trimDurationSec: 10 }),
				el({ id: "m2", type: "music", trimDurationSec: 20 }),
				el({ id: "m3", type: "music", trimDurationSec: 30 }),
				el({ id: "img1", type: "image", trimDurationSec: 10 }),
				el({ id: "m4", type: "music", trimDurationSec: 40 }),
				el({ id: "m5", type: "music", trimDurationSec: 50 }),
				el({ id: "video1", type: "video", trimDurationSec: 20 }),
			]);
			expect(layout.totalDurationSec).toBeCloseTo(30 - OVERLAP, 5);
			expect(seqs(layout, "music")).toHaveLength(2);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "music")[0])).toBeCloseTo(
				10 - OVERLAP,
				5,
			);
			// m5 starts with video1's scene, one transition early.
			expect(seqs(layout, "music")[1].start).toBeCloseTo(10 - OVERLAP, 5);
			expect(totalDuration(seqs(layout, "music")[1])).toBeCloseTo(20, 5);
		});

		it("emits N consecutive copies for a looped background, trimmed to the foreground span", () => {
			const layout = layoutOf([
				el({ id: "m1", type: "music", trimDurationSec: 10, loops: 4 }),
				el({ id: "img1", type: "image", trimDurationSec: 25 }),
			]);
			const music = seqs(layout, "music");
			expect(music).toHaveLength(3);
			expect(music[0]).toMatchObject({ start: 0, duration: 10 });
			expect(music[1]).toMatchObject({ start: 10, duration: 10 });
			expect(music[2]).toMatchObject({ start: 20, duration: 5 });
			expect(layout.totalDurationSec).toBe(25);
		});

		it("drops looped background copies that fall after a replacement background", () => {
			const layout = crossfaded([
				el({ id: "m1", type: "music", trimDurationSec: 10, loops: 4 }),
				el({ id: "img1", type: "image", trimDurationSec: 15 }),
				el({ id: "m2", type: "music", trimDurationSec: 20 }),
				el({ id: "img2", type: "image", trimDurationSec: 10 }),
			]);
			const music = seqs(layout, "music");
			expect(music).toHaveLength(3);
			expect(music[0]).toMatchObject({ start: 0, duration: 10 });
			expect(music[1].start).toBe(10);
			expect(music[1].duration).toBeCloseTo(5 - OVERLAP, 5);
			// m2 starts with img2's scene, one transition early.
			expect(music[2].start).toBeCloseTo(15 - OVERLAP, 5);
			expect(totalDuration(music[2])).toBeCloseTo(10, 5);
			expect(layout.totalDurationSec).toBeCloseTo(25 - OVERLAP, 5);
		});

		it("drops backgrounds when no scene exists", () => {
			const layout = layoutOf([
				el({ id: "m1", type: "music", trimDurationSec: 30 }),
			]);
			expect(layout.series).toHaveLength(0);
			expect(layout.totalDurationSec).toBe(0);
			expect(seqs(layout, "music")).toHaveLength(0);
		});
	});

	describe("effect elements (sound)", () => {
		it("stacks multiple effects at the current cursor", () => {
			const layout = layoutOf([
				el({ id: "s1", type: "sound", trimDurationSec: 1 }),
				el({ id: "s2", type: "sound", trimDurationSec: 5 }),
				el({ id: "video1", type: "video", trimDurationSec: 6 }),
				el({ id: "s3", type: "sound", trimDurationSec: 3 }),
				el({ id: "s4", type: "sound", trimDurationSec: 2 }),
			]);
			expect(layout.series[0].start).toBe(0);
			expect(totalDuration(layout.series[0])).toBe(6);
			expect(seqs(layout, "sound")).toHaveLength(4);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "sound")[0])).toBe(1);
			expect(seqs(layout, "sound")[1].start).toBe(0);
			expect(totalDuration(seqs(layout, "sound")[1])).toBe(5);
			expect(seqs(layout, "sound")[2].start).toBe(0);
			expect(totalDuration(seqs(layout, "sound")[2])).toBe(3);
			expect(seqs(layout, "sound")[3].start).toBe(0);
			expect(totalDuration(seqs(layout, "sound")[3])).toBe(2);
		});

		it("trims effects that extend beyond the total duration", () => {
			const layout = layoutOf([
				el({ id: "video1", type: "video", trimDurationSec: 20 }),
				el({ id: "s1", type: "sound", trimDurationSec: 50 }),
				el({ id: "s2", type: "sound", trimDurationSec: 20 }),
			]);
			expect(layout.totalDurationSec).toBe(20);
			expect(seqs(layout, "sound")).toHaveLength(2);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "sound")[0])).toBe(20);
			expect(seqs(layout, "sound")[1].start).toBe(0);
			expect(totalDuration(seqs(layout, "sound")[1])).toBe(20);
		});

		it("emits N copies of a looped effect at its native duration, overlapping by the crossfade", () => {
			const layout = layoutOf([
				el({ id: "video1", type: "video", trimDurationSec: 12 }),
				el({ id: "s1", type: "sound", trimDurationSec: 4, loops: 3 }),
			]);
			const sound = seqs(layout, "sound");
			expect(sound).toHaveLength(3);
			expect(sound[0].start).toBe(0);
			expect(totalDuration(sound[0])).toBe(4);
			expect(sound[1].start).toBeCloseTo(4 - LOOP_OVERLAP, 5);
			expect(totalDuration(sound[1])).toBe(4);
			expect(sound[2].start).toBeCloseTo(8 - 2 * LOOP_OVERLAP, 5);
			expect(totalDuration(sound[2])).toBe(4);
			expect(sound.every((s) => s.element?.id === "s1")).toBe(true);
		});

		it("cuts looped effect copies at the end of the video and drops the ones past it", () => {
			const layout = layoutOf([
				el({ id: "video1", type: "video", trimDurationSec: 5 }),
				el({ id: "s1", type: "sound", trimDurationSec: 4, loops: 3 }),
			]);
			const sound = seqs(layout, "sound");
			expect(sound).toHaveLength(2);
			expect(sound[0].start).toBe(0);
			expect(totalDuration(sound[0])).toBe(4);
			expect(sound[1].start).toBeCloseTo(4 - LOOP_OVERLAP, 5);
			expect(totalDuration(sound[1])).toBeCloseTo(1 + LOOP_OVERLAP, 5);
		});

		it("drops effects when no scene exists", () => {
			const layout = layoutOf([
				el({ id: "s1", type: "sound", trimDurationSec: 5 }),
			]);
			expect(layout.series).toHaveLength(0);
			expect(seqs(layout, "sound")).toHaveLength(0);
		});
	});

	describe("mixed scenes", () => {
		it("coagulates leading non-foreground elements into the first scene", () => {
			const layout = layoutOf([
				el({ id: "m1", type: "music", trimDurationSec: 10 }),
				el({ id: "s1", type: "sound", trimDurationSec: 5 }),
				el({ id: "n1", type: "narration", trimDurationSec: 4 }),
				el({ id: "s2", type: "sound", trimDurationSec: 3 }),
				el({ id: "c1", type: "character", trimDurationSec: 7 }),
				el({ id: "video1", type: "video", trimDurationSec: 2 }),
				el({ id: "m2", type: "music", trimDurationSec: 4 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(totalDuration(layout.series[0])).toBe(11);
			expect(layout.series[1].element.id).toBe("video1");
			expect(totalDuration(layout.series[1])).toBe(2);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "narration")[0])).toBe(4);
			expect(seqs(layout, "character")[0].start).toBe(4);
			expect(totalDuration(seqs(layout, "character")[0])).toBe(7);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(totalDuration(seqs(layout, "music")[0])).toBe(10);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(seqs(layout, "sound")[1].start).toBe(4);
			expect(seqs(layout, "music")).toHaveLength(1);
		});

		it("composes foreground, overlay, and background within a single layout", () => {
			const layout = crossfaded([
				el({ id: "m1", type: "music", trimDurationSec: 60 }),
				el({ id: "img1", type: "image", trimDurationSec: 3 }),
				el({ id: "n1", type: "narration", trimDurationSec: 5 }),
				el({ id: "video1", type: "video", trimDurationSec: 4 }),
				el({ id: "n2", type: "narration", trimDurationSec: 6 }),
			]);

			expect(layout.series).toHaveLength(2);
			expect(layout.series[0].element?.id).toBe("img1");
			expect(totalDuration(layout.series[0])).toBe(5);
			expect(layout.series[1].element?.id).toBe("video1");
			expect(totalDuration(layout.series[1])).toBeCloseTo(6, 5);
			expect(layout.totalDurationSec).toBeCloseTo(11 - OVERLAP, 5);

			expect(seqs(layout, "music")).toHaveLength(1);
			expect(seqs(layout, "narration")).toHaveLength(2);
		});
	});

	describe("config", () => {
		it("computes totalFrames from totalDurationSec and a custom fps", () => {
			const layout = layoutOf(
				[el({ id: "img1", type: "image", trimDurationSec: 5 })],
				{ fps: 30 },
			);
			expect(layout.totalFrames).toBe(150);
		});

		it("sizes the layout from the aspect ratio", () => {
			const layout = layoutOf(
				[el({ id: "img1", type: "image", trimDurationSec: 1 })],
				{ aspectRatio: "9:16" },
			);
			expect(layout.width).toBe(1080);
			expect(layout.height).toBe(1920);
		});
	});

	// <TransitionSeries> positions scenes implicitly (durations minus whole-frame
	// overlaps) while narration/music are positioned absolutely from layout.start.
	// Both must land on the same frame, or audio drifts further behind the visuals
	// with every scene boundary.
	describe("frame alignment with the rendered timeline", () => {
		it.each([24, 30, 25])(
			"keeps absolute layer starts on the TransitionSeries grid at %ifps",
			(fps) => {
				const elements = Array.from({ length: 10 }, (_, i) => [
					el({ id: `img${i}`, type: "image", trimDurationSec: 5 }),
					el({ id: `n${i}`, type: "narration", trimDurationSec: 4 }),
				]).flat();
				const layout = crossfaded(elements, { fps });
				const overlap = toFrames(layout.transitionDurationSec, fps);

				let renderedStart = 0;
				layout.series.forEach((scene, i) => {
					if (i > 0) renderedStart -= overlap;
					expect(toFrames(scene.start, fps)).toBe(renderedStart);
					expect(toFrames(seqs(layout, "narration")[i].start, fps)).toBe(
						renderedStart,
					);
					renderedStart += toFrames(totalDuration(scene), fps);
				});
			},
		);

		it("ends the composition exactly where TransitionSeries runs out of content", () => {
			const fps = 24;
			const elements = Array.from({ length: 10 }, (_, i) =>
				el({ id: `img${i}`, type: "image", trimDurationSec: 5 }),
			);
			const layout = crossfaded(elements, { fps });
			const overlap = toFrames(layout.transitionDurationSec, fps);

			const rendered = layout.series.reduce(
				(total, scene, i) =>
					total + toFrames(totalDuration(scene), fps) - (i > 0 ? overlap : 0),
				0,
			);
			expect(layout.totalFrames).toBe(rendered);
		});
	});

	describe("a scene's length", () => {
		const video = (trimDurationSec: number) =>
			el({ id: "video1", type: "video", trimDurationSec });
		const narration = (trimDurationSec: number) =>
			el({ id: "n1", type: "narration", trimDurationSec });

		it("plays a video out in full past shorter dialogue", () => {
			const layout = layoutOf([video(10), narration(3)]);
			expect(totalDuration(layout.series[0])).toBe(10);
			expect(layout.totalDurationSec).toBe(10);
		});

		it("runs past a video's own length for longer dialogue", () => {
			const layout = layoutOf([video(3), narration(10)]);
			expect(totalDuration(layout.series[0])).toBe(10);
		});
	});

	describe("frame grid", () => {
		const fps = 24;
		// 60.5 frames: the worst case for round(sum) vs sum(round).
		const OFF_GRID_SEC = 60.5 / fps;

		const fiveScenes = () =>
			Array.from({ length: 5 }, (_, i) => [
				el({ id: `img${i}`, type: "image" }),
				el({
					id: `nar${i}`,
					type: "narration",
					trimDurationSec: OFF_GRID_SEC,
				}),
			]).flat();

		it("keeps every layered start on the scene the renderer draws it over", () => {
			const layout = crossfaded(fiveScenes(), { fps });
			const overlapFrames = toFrames(layout.transitionDurationSec, fps);

			let rendered = 0;
			layout.series.forEach((scene, i) => {
				if (i > 0) rendered -= overlapFrames;
				expect(toFrames(seqs(layout, "narration")[i].start, fps)).toBe(
					rendered,
				);
				rendered += toFrames(totalDuration(scene), fps);
			});
		});

		it("snaps durations so no sequence rounds down to nothing", () => {
			const layout = layoutOf(fiveScenes(), { fps });
			for (const list of Object.values(layout.sequences)) {
				for (const seq of list ?? []) {
					expect(toFrames(totalDuration(seq), fps)).toBeGreaterThan(0);
				}
			}
		});
	});
});
