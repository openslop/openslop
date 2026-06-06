import { describe, expect, it } from "vitest";
import { findSegmentIndexAt, type SceneSegment } from "../useSceneSegments";

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
