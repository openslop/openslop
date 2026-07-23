import { describe, expect, it } from "vitest";
import type { SceneElement } from "@/lib/canvas/types";
import type { ResolvedElement, Sequence, VideoLayout } from "@/lib/video/types";
import {
	buildSceneSegments,
	findSegmentIndexAt,
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

describe("findSegmentIndexAt", () => {
	it("returns -1 when there are no segments", () => {
		expect(findSegmentIndexAt([], 0)).toBe(-1);
		expect(findSegmentIndexAt([], 10)).toBe(-1);
	});

	it("returns the first segment for time before any end", () => {
		expect(findSegmentIndexAt(segments, 0)).toBe(0);
		expect(findSegmentIndexAt(segments, 1.9)).toBe(0);
	});

	it("crosses to the next segment exactly at the previous boundary", () => {
		expect(findSegmentIndexAt(segments, 2)).toBe(1);
		expect(findSegmentIndexAt(segments, 5)).toBe(2);
	});

	it("returns the last segment for time at or beyond the total duration", () => {
		expect(findSegmentIndexAt(segments, 5.999)).toBe(2);
		expect(findSegmentIndexAt(segments, 6)).toBe(2);
		expect(findSegmentIndexAt(segments, 999)).toBe(2);
	});

	it("clamps negative times to the first segment", () => {
		expect(findSegmentIndexAt(segments, -1)).toBe(0);
	});

	it("handles a single segment", () => {
		const one = [seg("only", 0, 10)];
		expect(findSegmentIndexAt(one, 0)).toBe(0);
		expect(findSegmentIndexAt(one, 5)).toBe(0);
		expect(findSegmentIndexAt(one, 100)).toBe(0);
	});
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

const layout = (
	entries: Record<string, Sequence>,
	transitionDurationSec = 0,
): VideoLayout => ({
	series: [],
	sequences: {},
	sequenceByElementId: new Map(Object.entries(entries)),
	fps: 24,
	width: 1920,
	height: 1080,
	totalDurationSec: 0,
	totalFrames: 0,
	transitionType: "none",
	transitionDurationSec,
});

describe("buildSceneSegments", () => {
	it("returns an empty array when there are no scenes", () => {
		expect(buildSceneSegments([], layout({}))).toEqual([]);
	});

	it("maps each scene's foreground sequence to a segment", () => {
		const segments = buildSceneSegments(
			[scene("s1", "fg1")],
			layout({ fg1: sequence(0, 2, resolved("a.png")) }),
		);
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
		const segments = buildSceneSegments(
			[scene("s1", "fg1"), scene("s2", "fg2")],
			layout(
				{
					fg1: sequence(0, 2, resolved("a.png")),
					fg2: sequence(2, 3, resolved("b.png")),
				},
				0.5,
			),
		);
		expect(segments.map((s) => s.duration)).toEqual([1.5, 3]);
	});

	it("skips scenes with no foreground or no resolved sequence", () => {
		const segments = buildSceneSegments(
			[scene("s1", null), scene("s2", "missing"), scene("s3", "fg3")],
			layout({ fg3: sequence(0, 4, resolved("c.png")) }),
		);
		expect(segments.map((s) => s.sceneId)).toEqual(["s3"]);
	});

	it("emits a null thumbnail when the sequence has no element", () => {
		const [segment] = buildSceneSegments(
			[scene("s1", "fg1")],
			layout({ fg1: sequence(0, 2, null) }),
		);
		expect(segment.thumbnail).toBeNull();
	});
});
