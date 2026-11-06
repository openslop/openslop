import { describe, expect, it } from "vitest";
import { snapTarget, snapTargets, snapTrimEdge } from "../snap";
import type { ResolvedElement } from "../types";

const el = (over: Partial<ResolvedElement>): ResolvedElement => ({
	id: "v1",
	type: "video",
	role: "foreground",
	layer: "visual",
	sceneId: "s1",
	sceneNumber: 1,
	prompt: "",
	url: "https://example.com/v1.mp4",
	trimDurationSec: 4,
	mediaDurationSec: 10,
	trimStartSec: 0,
	loops: 1,
	loop: false,
	volume: 10,
	motion: "none",
	...over,
});

describe("snapTarget", () => {
	it("picks a target within reach", () => {
		expect(snapTarget(6.8, [6.9], 0.2)).toBe(6.9);
		expect(snapTarget(7.1, [6.9], 0.2)).toBe(6.9);
	});

	it("leaves a time with nothing in reach alone", () => {
		expect(snapTarget(6.8, [7.5, 2], 0.2)).toBeNull();
		expect(snapTarget(6.8, [], 0.2)).toBeNull();
	});

	it("takes the nearest of several", () => {
		expect(snapTarget(5, [4.9, 5.15, 5.05], 0.2)).toBe(5.05);
	});
});

describe("snapTrimEdge", () => {
	const clip = { element: el({}), start: 2 };

	it("holds the end on a target it comes near", () => {
		const { trim, snappedSec } = snapTrimEdge(clip, "end", 0.8, [6.9], 0.15);
		expect(snappedSec).toBe(6.9);
		expect(trim).toEqual({ trimStartSec: 0, trimDurationSec: 4.9 });
	});

	it("moves the end freely with nothing in reach", () => {
		const { trim, snappedSec } = snapTrimEdge(clip, "end", 0.8, [8], 0.15);
		expect(snappedSec).toBeNull();
		expect(trim).toEqual({ trimStartSec: 0, trimDurationSec: 4.8 });
	});

	it("cuts the in-point so the start handle rests on the target", () => {
		const { trim, snappedSec } = snapTrimEdge(clip, "start", 1.1, [3], 0.15);
		expect(snappedSec).toBe(3);
		expect(trim).toEqual({ trimStartSec: 1, trimDurationSec: 3 });
	});

	it("moves freely toward a target the media can't reach", () => {
		const short = { element: el({ trimDurationSec: 9.9 }), start: 0 };
		const { trim, snappedSec } = snapTrimEdge(short, "end", 0, [10.02], 0.2);
		expect(snappedSec).toBeNull();
		expect(trim.trimDurationSec).toBe(9.9);
	});
});

describe("snapTargets", () => {
	const image = el({ id: "img", type: "image", mediaDurationSec: 0 });
	const video = el({ id: "v", mediaDurationSec: 10, trimDurationSec: 4 });

	it("marks where every other clip starts and ends", () => {
		const clips = [
			{ element: image, start: 0, duration: 5 },
			{ element: video, start: 5, duration: 4 },
		];
		expect(new Set(snapTargets(clips, "v"))).toEqual(new Set([0, 5]));
	});

	it("marks where a video's media stops as well as where its scene ends", () => {
		const clips = [{ element: video, start: 0, duration: 6 }];
		expect(new Set(snapTargets(clips, "other"))).toEqual(new Set([0, 4, 6]));
	});
});
