import { describe, expect, it } from "vitest";
import { toFrames } from "../frames";
import { isBlankScene } from "../blankScene";
import { buildVideoLayout, type BuildLayoutOptions } from "../scene-builder";
import type { ResolvedElement, Sequence, VideoLayout } from "../types";
import type { CanvasElementType } from "@/lib/canvas/types";

// The rendered transition overlap: TRANSITION_DURATION_SEC (0.4s) snapped to the
// 24fps frame grid, which is what <TransitionSeries> actually lays down.
const OVERLAP = 10 / 24;

function seqs(layout: VideoLayout, type: CanvasElementType): Sequence[] {
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
		volume: 10,
		motion: "none",
		...overrides,
	};
}

/** Trimming makes a visual's own length moot, which most of these cases are built on. */
const untrimmed = (
	elements: ResolvedElement[],
	options?: BuildLayoutOptions,
): VideoLayout =>
	buildVideoLayout(elements, { trimVisualsToDialogue: false, ...options });

describe("buildVideoLayout", () => {
	describe("empty input", () => {
		it("returns an empty layout with the minimum frame count", () => {
			const layout = untrimmed([]);
			expect(layout.series).toHaveLength(0);
			expect(layout.totalDurationSec).toBe(0);
			expect(layout.totalFrames).toBe(2);
		});
	});

	describe("foreground elements (image, clip)", () => {
		it("creates a series entry for a single foreground element", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 5 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(layout.series[0].element?.id).toBe("img1");
			expect(layout.series[0].start).toBe(0);
			expect(layout.series[0].duration).toBe(5);
			expect(layout.totalDurationSec).toBe(5);
		});

		it("plays consecutive foreground elements end-to-end", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 5 }),
				el({ id: "clip1", type: "clip", durationSec: 3 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(layout.series[0].start).toBe(0);
			// Each foreground past the first overlaps the previous by one rendered
			// transition to match what <TransitionSeries> renders.
			expect(layout.series[1].start).toBeCloseTo(5 - OVERLAP, 5);
			expect(layout.totalDurationSec).toBeCloseTo(8 - OVERLAP, 5);
		});

		it("places overlays on the rendered timeline so they align with transitioned visuals", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 5 }),
				el({ id: "img2", type: "image", durationSec: 3 }),
				el({ id: "n1", type: "narration", durationSec: 2 }),
			]);
			expect(layout.series[1].start).toBeCloseTo(5 - OVERLAP, 5);
			expect(seqs(layout, "narration")[0].start).toBeCloseTo(5 - OVERLAP, 5);
			expect(layout.totalDurationSec).toBeCloseTo(8 - OVERLAP, 5);
		});

		it("clamps a foreground shorter than the minimum duration", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 0 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(layout.series[0].element?.id).toBe("img1");
			expect(layout.series[0].duration).toBe(1);
			expect(layout.totalDurationSec).toBe(1);
		});
	});

	describe("overlay elements (narration, character)", () => {
		it("opens a blank scene when no foreground precedes", () => {
			const layout = untrimmed([
				el({ id: "n1", type: "narration", durationSec: 4 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(layout.series[0].duration).toBe(4);
		});

		it("collapses consecutive leading overlays into one blank scene", () => {
			const layout = untrimmed([
				el({ id: "n1", type: "narration", durationSec: 3 }),
				el({ id: "n2", type: "narration", durationSec: 4 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(layout.series[0].duration).toBe(7);
			expect(seqs(layout, "narration")).toHaveLength(2);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "narration")[1].start).toBe(3);
		});

		it("extends the current series entry to fit a longer overlay", () => {
			const layout = untrimmed([
				el({ id: "clip1", type: "clip", durationSec: 5 }),
				el({ id: "n1", type: "narration", durationSec: 8 }),
			]);
			expect(layout.series).toHaveLength(1);
			expect(layout.series[0].duration).toBe(8);
			expect(seqs(layout, "narration")).toHaveLength(1);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "narration")[0].duration).toBe(8);
		});

		it("stacks consecutive overlays within the current series entry", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 0 }),
				el({ id: "n1", type: "narration", durationSec: 5 }),
				el({ id: "c1", type: "character", durationSec: 3 }),
			]);
			expect(layout.series[0].duration).toBe(8);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "character")[0].start).toBe(5);
		});

		it("plays a foreground after the overlay that leads it", () => {
			const layout = untrimmed([
				el({ id: "n1", type: "narration", durationSec: 9 }),
				el({ id: "img1", type: "image", durationSec: 5 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(layout.series[0].duration).toBe(9);
			expect(layout.series[1].element.id).toBe("img1");
			expect(layout.series[1].start).toBeCloseTo(9 - OVERLAP, 5);
			expect(layout.series[1].duration).toBe(5);
			expect(seqs(layout, "narration")[0].start).toBe(0);
		});

		it("delays the next foreground when an overlay extends past it", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 5 }),
				el({ id: "n1", type: "narration", durationSec: 9 }),
				el({ id: "clip1", type: "clip", durationSec: 6 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(layout.series[1].element?.id).toBe("clip1");
			expect(layout.series[1].start).toBeCloseTo(9 - OVERLAP, 5);
			expect(layout.series[1].duration).toBe(6);
		});

		it("starts the next foreground immediately when the overlay is shorter", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 30 }),
				el({ id: "n1", type: "narration", durationSec: 9 }),
				el({ id: "clip1", type: "clip", durationSec: 6 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(layout.series[1].element?.id).toBe("clip1");
			expect(layout.series[1].start).toBeCloseTo(30 - OVERLAP, 5);
			expect(layout.series[1].duration).toBe(6);
		});

		it("stretches the blank scene over the overlays that lead the video", () => {
			const layout = untrimmed([
				el({ id: "n1", type: "narration", durationSec: 9 }),
				el({ id: "c1", type: "character", durationSec: 3 }),
				el({ id: "img1", type: "image", durationSec: 4 }),
				el({ id: "n2", type: "narration", durationSec: 2 }),
				el({ id: "n3", type: "narration", durationSec: 3 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(layout.series[0].duration).toBe(12);
			expect(layout.series[1].element.id).toBe("img1");
			expect(layout.series[1].duration).toBeCloseTo(5, 5);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "narration")[1].start).toBeCloseTo(12 - OVERLAP, 5);
			expect(seqs(layout, "narration")[2].start).toBeCloseTo(14 - OVERLAP, 5);
		});
	});

	describe("background elements (music)", () => {
		it("trims a background to the foreground duration", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 30 }),
				el({ id: "img1", type: "image", durationSec: 10 }),
			]);
			expect(seqs(layout, "music")).toHaveLength(1);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(seqs(layout, "music")[0].duration).toBe(10);
		});

		it("clamps a background placed after a foreground to the minimum duration", () => {
			const layout = untrimmed([
				el({ id: "img1", type: "image", durationSec: 10 }),
				el({ id: "m1", type: "music", durationSec: 30 }),
			]);
			expect(seqs(layout, "music")).toHaveLength(1);
			expect(seqs(layout, "music")[0].start).toBe(10);
			expect(seqs(layout, "music")[0].duration).toBe(1);
		});

		it("caps the previous background when a new background of the same type starts", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 30 }),
				el({ id: "img1", type: "image", durationSec: 10 }),
				el({ id: "m2", type: "music", durationSec: 20 }),
			]);
			expect(seqs(layout, "music")).toHaveLength(2);
			expect(seqs(layout, "music")[0].duration).toBe(10);
			expect(seqs(layout, "music")[1].start).toBe(10);
			expect(seqs(layout, "music")[1].duration).toBe(1);
		});

		it("leaves an earlier background untouched when it ends before its replacement", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 10 }),
				el({ id: "clip1", type: "clip", durationSec: 10 }),
				el({ id: "c1", type: "character", durationSec: 5 }),
				el({ id: "m2", type: "music", durationSec: 20 }),
				el({ id: "c2", type: "character", durationSec: 5 }),
				el({ id: "img1", type: "image", durationSec: 6 }),
			]);
			expect(layout.totalDurationSec).toBeCloseTo(16 - OVERLAP, 5);
			expect(seqs(layout, "music")).toHaveLength(2);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(seqs(layout, "music")[0].duration).toBe(10);
			expect(seqs(layout, "music")[1].start).toBe(10);
			// m2 trimmed to the rendered total since img1 is overlapped by one transition.
			expect(seqs(layout, "music")[1].duration).toBeCloseTo(6 - OVERLAP, 5);
		});

		it("collapses consecutive backgrounds at the same offset to the latest", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 10 }),
				el({ id: "m2", type: "music", durationSec: 20 }),
				el({ id: "m3", type: "music", durationSec: 30 }),
				el({ id: "img1", type: "image", durationSec: 10 }),
				el({ id: "m4", type: "music", durationSec: 40 }),
				el({ id: "m5", type: "music", durationSec: 50 }),
				el({ id: "clip1", type: "clip", durationSec: 20 }),
			]);
			expect(layout.totalDurationSec).toBeCloseTo(30 - OVERLAP, 5);
			expect(seqs(layout, "music")).toHaveLength(2);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(seqs(layout, "music")[0].duration).toBe(10);
			expect(seqs(layout, "music")[1].start).toBe(10);
			// m5 trimmed to the rendered total since clip1 is overlapped by one transition.
			expect(seqs(layout, "music")[1].duration).toBeCloseTo(20 - OVERLAP, 5);
		});

		it("emits N consecutive copies for a looped background, trimmed to the foreground span", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 10, loops: 4 }),
				el({ id: "img1", type: "image", durationSec: 25 }),
			]);
			const music = seqs(layout, "music");
			expect(music).toHaveLength(4);
			expect(music[0]).toMatchObject({ start: 0, duration: 10 });
			expect(music[1]).toMatchObject({ start: 10, duration: 10 });
			expect(music[2]).toMatchObject({ start: 20, duration: 5 });
			expect(music[3].start).toBe(30);
			expect(music[3].duration).toBe(1);
			expect(layout.totalDurationSec).toBe(25);
		});

		it("drops looped background copies that fall after a replacement background", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 10, loops: 4 }),
				el({ id: "img1", type: "image", durationSec: 15 }),
				el({ id: "m2", type: "music", durationSec: 20 }),
				el({ id: "img2", type: "image", durationSec: 10 }),
			]);
			const music = seqs(layout, "music");
			expect(music).toHaveLength(3);
			expect(music[0]).toMatchObject({ start: 0, duration: 10 });
			expect(music[1]).toMatchObject({ start: 10, duration: 5 });
			// m2 trimmed to the rendered total since img2 is overlapped by one transition.
			expect(music[2].start).toBe(15);
			expect(music[2].duration).toBeCloseTo(10 - OVERLAP, 5);
			expect(layout.totalDurationSec).toBeCloseTo(25 - OVERLAP, 5);
		});

		it("emits a clamped background sequence when no series elements exist", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 30 }),
			]);
			expect(layout.series).toHaveLength(0);
			expect(layout.totalDurationSec).toBe(0);
			expect(seqs(layout, "music")).toHaveLength(1);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(seqs(layout, "music")[0].duration).toBe(1);
		});
	});

	describe("effect elements (sound)", () => {
		it("stacks multiple effects at the current cursor", () => {
			const layout = untrimmed([
				el({ id: "s1", type: "sound", durationSec: 1 }),
				el({ id: "s2", type: "sound", durationSec: 5 }),
				el({ id: "clip1", type: "clip", durationSec: 6 }),
				el({ id: "s3", type: "sound", durationSec: 3 }),
				el({ id: "s4", type: "sound", durationSec: 2 }),
			]);
			expect(layout.series[0].start).toBe(0);
			expect(layout.series[0].duration).toBe(6);
			expect(seqs(layout, "sound")).toHaveLength(4);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(seqs(layout, "sound")[0].duration).toBe(1);
			expect(seqs(layout, "sound")[1].start).toBe(0);
			expect(seqs(layout, "sound")[1].duration).toBe(5);
			expect(seqs(layout, "sound")[2].start).toBe(0);
			expect(seqs(layout, "sound")[2].duration).toBe(3);
			expect(seqs(layout, "sound")[3].start).toBe(0);
			expect(seqs(layout, "sound")[3].duration).toBe(2);
		});

		it("trims effects that extend beyond the total duration", () => {
			const layout = untrimmed([
				el({ id: "clip1", type: "clip", durationSec: 20 }),
				el({ id: "s1", type: "sound", durationSec: 50 }),
				el({ id: "s2", type: "sound", durationSec: 20 }),
			]);
			expect(layout.totalDurationSec).toBe(20);
			expect(seqs(layout, "sound")).toHaveLength(2);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(seqs(layout, "sound")[0].duration).toBe(20);
			expect(seqs(layout, "sound")[1].start).toBe(0);
			expect(seqs(layout, "sound")[1].duration).toBe(20);
		});

		it("emits N consecutive copies of a looped effect at the native clip duration", () => {
			const layout = untrimmed([
				el({ id: "clip1", type: "clip", durationSec: 12 }),
				el({ id: "s1", type: "sound", durationSec: 4, loops: 3 }),
			]);
			const sound = seqs(layout, "sound");
			expect(sound).toHaveLength(3);
			expect(sound[0].start).toBe(0);
			expect(sound[0].duration).toBe(4);
			expect(sound[1].start).toBe(4);
			expect(sound[1].duration).toBe(4);
			expect(sound[2].start).toBe(8);
			expect(sound[2].duration).toBe(4);
			expect(sound.every((s) => s.element?.id === "s1")).toBe(true);
		});

		it("trims looped effect copies that extend past the total duration", () => {
			const layout = untrimmed([
				el({ id: "clip1", type: "clip", durationSec: 5 }),
				el({ id: "s1", type: "sound", durationSec: 4, loops: 3 }),
			]);
			const sound = seqs(layout, "sound");
			expect(sound).toHaveLength(3);
			expect(sound[0].start).toBe(0);
			expect(sound[0].duration).toBe(4);
			expect(sound[1].start).toBe(4);
			expect(sound[1].duration).toBe(1);
			expect(sound[2].start).toBe(8);
			expect(sound[2].duration).toBe(1);
		});

		it("emits a clamped effect sequence when no series elements exist", () => {
			const layout = untrimmed([
				el({ id: "s1", type: "sound", durationSec: 5 }),
			]);
			expect(layout.series).toHaveLength(0);
			expect(layout.totalDurationSec).toBe(0);
			expect(seqs(layout, "sound")).toHaveLength(1);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(seqs(layout, "sound")[0].duration).toBe(1);
		});
	});

	describe("mixed scenes", () => {
		it("coagulates leading non-foreground elements into the first scene", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 10 }),
				el({ id: "s1", type: "sound", durationSec: 5 }),
				el({ id: "n1", type: "narration", durationSec: 4 }),
				el({ id: "s2", type: "sound", durationSec: 3 }),
				el({ id: "c1", type: "character", durationSec: 7 }),
				el({ id: "clip1", type: "clip", durationSec: 2 }),
				el({ id: "m2", type: "music", durationSec: 4 }),
			]);
			expect(layout.series).toHaveLength(2);
			expect(isBlankScene(layout.series[0].element)).toBe(true);
			expect(layout.series[0].duration).toBe(11);
			expect(layout.series[1].element.id).toBe("clip1");
			expect(layout.series[1].duration).toBe(2);
			expect(seqs(layout, "narration")[0].start).toBe(0);
			expect(seqs(layout, "narration")[0].duration).toBe(4);
			expect(seqs(layout, "character")[0].start).toBe(4);
			expect(seqs(layout, "character")[0].duration).toBe(7);
			expect(seqs(layout, "music")[0].start).toBe(0);
			expect(seqs(layout, "music")[0].duration).toBe(10);
			expect(seqs(layout, "sound")[0].start).toBe(0);
			expect(seqs(layout, "sound")[1].start).toBe(4);
			expect(seqs(layout, "music")).toHaveLength(2);
		});

		it("composes foreground, overlay, and background within a single layout", () => {
			const layout = untrimmed([
				el({ id: "m1", type: "music", durationSec: 60 }),
				el({ id: "img1", type: "image", durationSec: 3 }),
				el({ id: "n1", type: "narration", durationSec: 5 }),
				el({ id: "clip1", type: "clip", durationSec: 4 }),
				el({ id: "n2", type: "narration", durationSec: 6 }),
			]);

			expect(layout.series).toHaveLength(2);
			expect(layout.series[0].element?.id).toBe("img1");
			expect(layout.series[0].duration).toBe(5);
			expect(layout.series[1].element?.id).toBe("clip1");
			expect(layout.series[1].duration).toBeCloseTo(6, 5);
			expect(layout.totalDurationSec).toBeCloseTo(11 - OVERLAP, 5);

			expect(seqs(layout, "music")).toHaveLength(1);
			expect(seqs(layout, "narration")).toHaveLength(2);
		});
	});

	describe("config", () => {
		it("computes totalFrames from totalDurationSec and a custom fps", () => {
			const layout = untrimmed(
				[el({ id: "img1", type: "image", durationSec: 5 })],
				{ fps: 30 },
			);
			expect(layout.totalFrames).toBe(150);
		});

		it("propagates custom width and height to the layout", () => {
			const layout = untrimmed(
				[el({ id: "img1", type: "image", durationSec: 1 })],
				{ width: 1280, height: 720 },
			);
			expect(layout.width).toBe(1280);
			expect(layout.height).toBe(720);
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
					el({ id: `img${i}`, type: "image", durationSec: 5 }),
					el({ id: `n${i}`, type: "narration", durationSec: 4 }),
				]).flat();
				const layout = untrimmed(elements, { fps });
				const overlap = toFrames(layout.transitionDurationSec, fps);

				let renderedStart = 0;
				layout.series.forEach((scene, i) => {
					if (i > 0) renderedStart -= overlap;
					expect(toFrames(scene.start, fps)).toBe(renderedStart);
					expect(toFrames(seqs(layout, "narration")[i].start, fps)).toBe(
						renderedStart,
					);
					renderedStart += toFrames(scene.duration, fps);
				});
			},
		);

		it("ends the composition exactly where TransitionSeries runs out of content", () => {
			const fps = 24;
			const elements = Array.from({ length: 10 }, (_, i) =>
				el({ id: `img${i}`, type: "image", durationSec: 5 }),
			);
			const layout = untrimmed(elements, { fps });
			const overlap = toFrames(layout.transitionDurationSec, fps);

			const rendered = layout.series.reduce(
				(total, scene, i) =>
					total + toFrames(scene.duration, fps) - (i > 0 ? overlap : 0),
				0,
			);
			expect(layout.totalFrames).toBe(rendered);
		});
	});

	describe("trimming visuals to dialogue (the default)", () => {
		it("cuts a foreground to the dialogue after it, ignoring its own length", () => {
			const layout = buildVideoLayout([
				el({ id: "clip1", type: "clip", durationSec: 10 }),
				el({ id: "n1", type: "narration", durationSec: 3 }),
			]);
			expect(layout.series[0].duration).toBe(3);
			expect(layout.totalDurationSec).toBe(3);
		});

		it("holds a foreground with no dialogue after it for the minimum duration", () => {
			const layout = buildVideoLayout([
				el({ id: "clip1", type: "clip", durationSec: 10 }),
			]);
			expect(layout.series[0].duration).toBe(1);
		});

		it("trims a background to the dialogue-driven span, not the clip's own length", () => {
			const layout = buildVideoLayout([
				el({ id: "m1", type: "music", durationSec: 30 }),
				el({ id: "clip1", type: "clip", durationSec: 10 }),
				el({ id: "n1", type: "narration", durationSec: 4 }),
			]);
			expect(seqs(layout, "music")[0].duration).toBe(4);
		});

		it("plays the clip out in full when trimming is off", () => {
			const layout = buildVideoLayout(
				[
					el({ id: "clip1", type: "clip", durationSec: 10 }),
					el({ id: "n1", type: "narration", durationSec: 3 }),
				],
				{ trimVisualsToDialogue: false },
			);
			expect(layout.series[0].duration).toBe(10);
			expect(layout.totalDurationSec).toBe(10);
		});
	});

	// The renderer positions each scene by rounding its own duration and stacking
	// the results, while every layered clip is positioned from the accumulated
	// seconds. Sub-frame scene durations make those two disagree by a frame that
	// grows with the scene count, which is audio drifting off its picture.
	describe("frame grid", () => {
		const fps = 24;
		// 60.5 frames: the worst case for round(sum) vs sum(round).
		const OFF_GRID_SEC = 60.5 / fps;

		const fiveScenes = () =>
			Array.from({ length: 5 }, (_, i) => [
				el({ id: `img${i}`, type: "image" }),
				el({ id: `nar${i}`, type: "narration", durationSec: OFF_GRID_SEC }),
			]).flat();

		it("keeps every layered start on the scene the renderer draws it over", () => {
			const layout = buildVideoLayout(fiveScenes(), { fps });
			const overlapFrames = toFrames(layout.transitionDurationSec, fps);

			let rendered = 0;
			layout.series.forEach((scene, i) => {
				if (i > 0) rendered -= overlapFrames;
				expect(toFrames(seqs(layout, "narration")[i].start, fps)).toBe(
					rendered,
				);
				rendered += toFrames(scene.duration, fps);
			});
		});

		it("snaps durations so no sequence rounds down to nothing", () => {
			const layout = buildVideoLayout(fiveScenes(), { fps });
			for (const list of Object.values(layout.sequences)) {
				for (const seq of list ?? []) {
					expect(toFrames(seq.duration, fps)).toBeGreaterThan(0);
				}
			}
		});
	});
});
