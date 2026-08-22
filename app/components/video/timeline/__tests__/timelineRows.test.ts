import { describe, expect, it } from "vitest";
import { ELEMENT_TYPES, type CanvasElementType } from "@/lib/canvas/types";
import { isBlankScene } from "@/lib/video/blankScene";
import {
	buildVideoLayout,
	type BuildLayoutOptions,
} from "@/lib/video/scene-builder";
import type { ResolvedElement } from "@/lib/video/types";
import { buildTimelineRows, packLanes } from "../timelineRows";

function el(
	id: string,
	type: CanvasElementType,
	overrides: Partial<ResolvedElement> = {},
): ResolvedElement {
	const { role, layer } = ELEMENT_TYPES[type];
	return {
		id,
		type,
		role,
		layer,
		sceneId: "s1",
		sceneNumber: 1,
		prompt: "",
		url: `https://example.com/${id}`,
		durationSec: 4,
		loops: 1,
		volume: 10,
		motion: "none",
		...overrides,
	};
}

/** These rows are laid out from a visual's own length, which trimming makes moot. */
const untrimmed = (elements: ResolvedElement[], options?: BuildLayoutOptions) =>
	buildVideoLayout(elements, { trimVisualsToDialogue: false, ...options });

describe("packLanes", () => {
	const clip = (start: number, duration: number) => ({
		element: el("sfx", "sound"),
		start,
		duration,
	});

	it("keeps clips that never overlap in one lane", () => {
		expect(packLanes([clip(0, 2), clip(2, 2), clip(5, 1)])).toHaveLength(1);
	});

	it("opens a lane per simultaneous clip", () => {
		const lanes = packLanes([clip(0, 5), clip(1, 5), clip(2, 1)]);
		expect(lanes.map((lane) => lane.length)).toEqual([1, 1, 1]);
	});

	it("keeps clips that only overlap within the tolerance together", () => {
		expect(packLanes([clip(0, 5), clip(4.7, 3)], 0.5)).toHaveLength(1);
		expect(packLanes([clip(0, 5), clip(4.7, 3)], 0.1)).toHaveLength(2);
	});

	it("reuses a lane once its last clip has ended", () => {
		const lanes = packLanes([clip(0, 4), clip(1, 1), clip(4, 2)]);
		expect(lanes.map((lane) => lane.map((c) => c.start))).toEqual([
			[0, 4],
			[1],
		]);
	});
});

describe("buildTimelineRows", () => {
	it("has no rows for an empty layout", () => {
		expect(buildTimelineRows(untrimmed([]))).toEqual([]);
	});

	it("drops lanes that hold nothing", () => {
		const rows = buildTimelineRows(untrimmed([el("a", "image")]));
		expect(rows.map((row) => row.id)).toEqual(["foreground"]);
	});

	it("puts each role in its own lane, in stacking order", () => {
		const layout = untrimmed([
			el("bgm", "music"),
			el("img", "image"),
			el("sfx", "sound"),
			el("voice", "narration"),
		]);
		const rows = buildTimelineRows(layout);
		expect(rows.map((row) => row.id)).toEqual([
			"foreground",
			"overlay",
			"effect",
			"background",
		]);
		expect(rows.map((row) => row.kind)).toEqual([
			"visual",
			"audio",
			"audio",
			"audio",
		]);
	});

	it("merges narration and character into the voice lane, ordered by start", () => {
		const layout = untrimmed([
			el("n1", "narration", { durationSec: 2 }),
			el("c1", "character", { durationSec: 3 }),
			el("n2", "narration", { durationSec: 1 }),
		]);
		const voice = buildTimelineRows(layout).find((row) => row.id === "overlay");
		expect(voice?.clips.map((clip) => clip.element?.id)).toEqual([
			"n1",
			"c1",
			"n2",
		]);
		expect(voice?.clips.map((clip) => clip.start)).toEqual([0, 2, 5]);
	});

	it("expands a looped element into one clip per loop", () => {
		const layout = untrimmed([
			el("bgm", "music", { durationSec: 3, loops: 3 }),
			el("img", "image", { durationSec: 9 }),
		]);
		const music = buildTimelineRows(layout).find(
			(row) => row.id === "background",
		);
		expect(music?.clips).toHaveLength(3);
		expect(music?.clips.map((clip) => clip.key)).toEqual([
			"bgm-0",
			"bgm-3",
			"bgm-6",
		]);
	});

	it("trims the transition overlap so scenes abut instead of running over", () => {
		const layout = untrimmed([
			el("a", "image", { durationSec: 5 }),
			el("b", "image", { durationSec: 5 }),
			el("c", "image", { durationSec: 5 }),
		]);
		const clips = buildTimelineRows(layout)[0].clips;
		for (const [i, clip] of clips.entries()) {
			const next = clips[i + 1];
			if (next) expect(clip.start + clip.duration).toBeCloseTo(next.start);
		}
		const last = clips[clips.length - 1];
		expect(last.start + last.duration).toBeCloseTo(layout.totalDurationSec);
	});

	it("keeps voices on one lane across a scene transition", () => {
		const layout = untrimmed([
			el("n1", "narration", { durationSec: 3 }),
			el("a", "image", { durationSec: 3 }),
			el("n2", "narration", { durationSec: 3 }),
			el("b", "image", { durationSec: 3 }),
		]);
		const voice = buildTimelineRows(layout).filter(
			(row) => row.id === "overlay",
		);
		expect(voice).toHaveLength(1);
		expect(voice[0].clips).toHaveLength(2);
	});

	it("drops a clip that starts after the video ends", () => {
		const layout = untrimmed([
			el("img", "image", { durationSec: 5 }),
			el("sfx", "sound", { durationSec: 4, loops: 3 }),
		]);
		const effects = buildTimelineRows(layout).filter(
			(row) => row.id === "effect",
		);
		// Copies at 0 and 4 fall inside a 5s video; the one at 8 does not.
		expect(
			effects.flatMap((row) => row.clips).map((clip) => clip.start),
		).toEqual([0, 4]);
	});

	it("draws a clip that overruns the end only as far as the video goes", () => {
		const layout = untrimmed([
			el("img", "image", { durationSec: 5 }),
			el("sfx", "sound", { durationSec: 4, loops: 2 }),
		]);
		const clips = buildTimelineRows(layout)
			.filter((row) => row.id === "effect")
			.flatMap((row) => row.clips);
		expect(clips.map((clip) => clip.start + clip.duration)).toEqual([4, 5]);
	});

	it("splits overlapping sounds into a lane each", () => {
		const layout = untrimmed([
			el("img", "image", { durationSec: 10 }),
			el("s1", "sound", { durationSec: 6 }),
			el("s2", "sound", { durationSec: 6 }),
		]);
		const effects = buildTimelineRows(layout).filter(
			(row) => row.id === "effect",
		);
		expect(effects).toHaveLength(2);
		expect(effects.map((row) => row.key)).toEqual(["effect-0", "effect-1"]);
	});

	it("opens a blank scene when an overlay leads the video", () => {
		const rows = buildTimelineRows(untrimmed([el("voice", "narration")]));
		const visual = rows.find((row) => row.id === "foreground");
		expect(visual?.clips).toHaveLength(1);
		expect(isBlankScene(visual?.clips[0].element as ResolvedElement)).toBe(
			true,
		);
	});
});
