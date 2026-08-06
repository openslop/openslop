import { describe, expect, it } from "vitest";
import type { SceneElement } from "@/lib/canvas/types";
import { toFrames } from "@/lib/video/frames";
import type { ResolvedElement, Sequence, VideoLayout } from "@/lib/video/types";
import {
	buildSceneSegments,
	buildSequenceIndex,
	findSegmentIndexAtFrame,
	type SceneSegment,
} from "../useSceneSegments";

const seg = (
	sceneId: string,
	start: number,
	duration: number,
): SceneSegment => ({
	sceneId,
	sceneIndex: 0,
	start,
	duration,
	label: sceneId,
	thumbnail: null,
});

const segments: SceneSegment[] = [
	seg("a", 0, 2),
	seg("b", 2, 3),
	seg("c", 5, 1),
];

const FPS = 24;

/** Starts on `frame` but a hair after it, so `toFrames` rounds back down. */
const unalignedStart = (frame: number, fps: number) => (frame + 0.2) / fps;

describe("findSegmentIndexAtFrame", () => {
	it("returns -1 when there are no segments", () => {
		expect(findSegmentIndexAtFrame([], 0, FPS)).toBe(-1);
		expect(findSegmentIndexAtFrame([], 240, FPS)).toBe(-1);
	});

	it("returns the first segment for frames before any end", () => {
		expect(findSegmentIndexAtFrame(segments, 0, FPS)).toBe(0);
		expect(findSegmentIndexAtFrame(segments, 47, FPS)).toBe(0);
	});

	it("crosses to the next segment exactly at the previous boundary", () => {
		expect(findSegmentIndexAtFrame(segments, 48, FPS)).toBe(1);
		expect(findSegmentIndexAtFrame(segments, 120, FPS)).toBe(2);
	});

	it("returns the last segment at or beyond the total duration", () => {
		expect(findSegmentIndexAtFrame(segments, 143, FPS)).toBe(2);
		expect(findSegmentIndexAtFrame(segments, 144, FPS)).toBe(2);
		expect(findSegmentIndexAtFrame(segments, 9999, FPS)).toBe(2);
	});

	it("clamps negative frames to the first segment", () => {
		expect(findSegmentIndexAtFrame(segments, -1, FPS)).toBe(0);
	});

	it("handles a single segment", () => {
		const one = [seg("only", 0, 10)];
		expect(findSegmentIndexAtFrame(one, 0, FPS)).toBe(0);
		expect(findSegmentIndexAtFrame(one, 120, FPS)).toBe(0);
		expect(findSegmentIndexAtFrame(one, 9999, FPS)).toBe(0);
	});

	it.each([24, 25, 30])(
		"resolves a start that rounds down to its own segment at %ifps",
		(fps) => {
			const start = unalignedStart(151, fps);
			const unaligned = [seg("a", 0, start), seg("b", start, 2)];
			const frame = toFrames(start, fps);
			expect(frame).toBe(151);
			expect(findSegmentIndexAtFrame(unaligned, frame, fps)).toBe(1);
		},
	);

	it.each([24, 25, 30])(
		"steps one segment per seek across unaligned starts at %ifps",
		(fps) => {
			const starts = [0, ...[151, 307, 461].map((f) => unalignedStart(f, fps))];
			const unaligned = starts.map((start, i) =>
				seg(`s${i}`, start, (starts[i + 1] ?? starts[i] + 2) - start),
			);
			let index = 0;
			for (let step = 1; step < unaligned.length; step++) {
				index = findSegmentIndexAtFrame(
					unaligned,
					toFrames(unaligned[index + 1].start, fps),
					fps,
				);
				expect(index).toBe(step);
			}
		},
	);
});

const resolved = (url: string): ResolvedElement => ({
	id: `${url}-el`,
	type: "image",
	role: "foreground",
	layer: "visual",
	url,
	durationSec: 0,
	loops: 1,
	volume: 10,
	motion: "none",
});

const sequence = (
	start: number,
	duration: number,
	element: ResolvedElement | null,
): Sequence => ({ element, start, duration });

const scene = (id: string, foregroundId: string | null): SceneElement => ({
	id,
	type: "scene",
	children: foregroundId
		? [
				{
					id: foregroundId,
					type: "image",
					children: [{ id: `${foregroundId}-t`, type: "image", text: "" }],
				},
			]
		: [],
});

const layout = (transitionDurationSec = 0): VideoLayout => ({
	series: [],
	sequences: {},
	fps: 24,
	width: 1920,
	height: 1080,
	totalDurationSec: 0,
	totalFrames: 0,
	transitionType: "none",
	transitionDurationSec,
});

const segmentsOf = (
	scenes: SceneElement[],
	entries: Record<string, Sequence>,
	transitionDurationSec = 0,
) =>
	buildSceneSegments(
		scenes,
		layout(transitionDurationSec),
		new Map(Object.entries(entries)),
	);

describe("buildSequenceIndex", () => {
	it("keys sequences by their element id and skips placeholders", () => {
		const withElement = sequence(0, 2, resolved("a.png"));
		const index = buildSequenceIndex([withElement, sequence(2, 1, null)]);
		expect(index.size).toBe(1);
		expect(index.get("a.png-el")).toBe(withElement);
	});
});

describe("buildSceneSegments", () => {
	it("returns an empty array when there are no scenes", () => {
		expect(segmentsOf([], {})).toEqual([]);
	});

	it("maps each scene's foreground sequence to a segment", () => {
		const segments = segmentsOf([scene("s1", "fg1")], {
			fg1: sequence(0, 2, resolved("a.png")),
		});
		expect(segments).toEqual([
			{
				sceneId: "s1",
				sceneIndex: 1,
				start: 0,
				duration: 2,
				label: "Scene 1",
				thumbnail: { url: "a.png", kind: "image" },
			},
		]);
	});

	it("trims the previous segment by the transition overlap", () => {
		const segments = segmentsOf(
			[scene("s1", "fg1"), scene("s2", "fg2")],
			{
				fg1: sequence(0, 2, resolved("a.png")),
				fg2: sequence(2, 3, resolved("b.png")),
			},
			0.5,
		);
		expect(segments.map((s) => s.duration)).toEqual([1.5, 3]);
	});

	it("skips scenes with no foreground or no resolved sequence", () => {
		const segments = segmentsOf(
			[scene("s1", null), scene("s2", "missing"), scene("s3", "fg3")],
			{ fg3: sequence(0, 4, resolved("c.png")) },
		);
		expect(segments.map((s) => s.sceneId)).toEqual(["s3"]);
	});

	it("emits a null thumbnail when the sequence has no element", () => {
		const [segment] = segmentsOf([scene("s1", "fg1")], {
			fg1: sequence(0, 2, null),
		});
		expect(segment.thumbnail).toBeNull();
	});
});
