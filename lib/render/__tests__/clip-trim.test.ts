import { describe, expect, it } from "vitest";
import {
	isTrimmable,
	isTrimmed,
	playedSec,
	trimClip,
	trimEdge,
	trimTimestamps,
} from "../clip-trim";
import { toCaption } from "@/lib/captions/word-captions";

describe("isTrimmable", () => {
	it("trims only what has a media length", () => {
		expect(isTrimmable({ mediaDurationSec: 5 })).toBe(true);
		expect(isTrimmable({ mediaDurationSec: 0 })).toBe(false);
	});
});

describe("isTrimmed", () => {
	it("is trimmed once it opens late, ends early or runs long", () => {
		const full = { trimStartSec: 0, durationSec: 10, mediaDurationSec: 10 };
		expect(isTrimmed(full)).toBe(false);
		expect(isTrimmed({ ...full, trimStartSec: 1 })).toBe(true);
		expect(isTrimmed({ ...full, durationSec: 4 })).toBe(true);
		expect(isTrimmed({ ...full, durationSec: 12 })).toBe(true);
	});

	it("is never trimmed without media, like a still or the blank opener", () => {
		expect(
			isTrimmed({ trimStartSec: 0, durationSec: 4, mediaDurationSec: 0 }),
		).toBe(false);
	});
});

describe("playedSec", () => {
	it("plays the media up to the clip's end, or to the media's own if that comes first", () => {
		const clip = { trimStartSec: 2, durationSec: 5, mediaDurationSec: 10 };
		expect(playedSec(clip)).toBe(5);
		expect(playedSec({ ...clip, durationSec: 20 })).toBe(8);
	});
});

const audio = { layer: "audio", mediaDurationSec: 10 } as const;
const video = { layer: "visual", mediaDurationSec: 10 } as const;

describe("trimClip", () => {
	it("plays from its trim start to the end of its media", () => {
		expect(trimClip(audio, 3)).toEqual({ trimStartSec: 3, durationSec: 7 });
		expect(trimClip(video, 3)).toEqual({ trimStartSec: 3, durationSec: 7 });
	});

	it("cuts audio at its timeline duration, but never past its media", () => {
		expect(trimClip(audio, 2, 4).durationSec).toBe(4);
		expect(trimClip(audio, 2, 20).durationSec).toBe(8);
	});

	it("runs a visual past its media for as long as its timeline duration", () => {
		expect(trimClip(video, 2, 20).durationSec).toBe(20);
	});

	it("keeps a trim start inside the media, at least the minimum from its end", () => {
		expect(trimClip(audio, 50).trimStartSec).toBe(9);
		expect(trimClip(video, 50).trimStartSec).toBe(9);
	});
});

describe("trimEdge", () => {
	const clip = { ...audio, trimStartSec: 2, durationSec: 5 };
	const extended = { ...video, trimStartSec: 2, durationSec: 30 };

	it("lengthens and shortens from the end, keeping the start", () => {
		expect(trimEdge(clip, "end", -2)).toEqual({
			trimStartSec: 2,
			durationSec: 3,
		});
		expect(trimEdge(clip, "end", 1)).toEqual({
			trimStartSec: 2,
			durationSec: 6,
		});
	});

	it("stops audio's end at its media and at the minimum", () => {
		expect(trimEdge(clip, "end", 50).durationSec).toBe(8);
		expect(trimEdge(clip, "end", -50).durationSec).toBe(1);
	});

	it("drags a visual's end past its media", () => {
		expect(trimEdge({ ...clip, ...video }, "end", 50).durationSec).toBe(55);
	});

	it("keeps an extended visual's in-point inside its media", () => {
		expect(trimEdge(extended, "start", 50)).toEqual({
			trimStartSec: 9,
			durationSec: 23,
		});
	});

	it("moves the in-point with the start edge, shortening the clip as much", () => {
		expect(trimEdge(clip, "start", 1)).toEqual({
			trimStartSec: 3,
			durationSec: 4,
		});
		expect(trimEdge(clip, "start", -1)).toEqual({
			trimStartSec: 1,
			durationSec: 6,
		});
	});

	it("uncovers no more than was trimmed off, and keeps the minimum", () => {
		expect(trimEdge(clip, "start", -50)).toEqual({
			trimStartSec: 0,
			durationSec: 7,
		});
		expect(trimEdge(clip, "start", 50)).toEqual({
			trimStartSec: 6,
			durationSec: 1,
		});
	});

	describe("with a floor", () => {
		const scene = { ...video, trimStartSec: 2, durationSec: 8 };

		it("stops the end at the floor instead of cutting the visual short", () => {
			expect(trimEdge(scene, "end", -50, 4).durationSec).toBe(4);
			expect(trimEdge(scene, "end", -3, 4).durationSec).toBe(5);
		});

		it("stops the start where the clip would dip under the floor", () => {
			expect(trimEdge(scene, "start", 50, 4)).toEqual({
				trimStartSec: 6,
				durationSec: 4,
			});
			expect(trimEdge(scene, "start", 50, 6)).toEqual({
				trimStartSec: 4,
				durationSec: 6,
			});
		});

		it("rests at the floor when the visual is shorter than the dialogue", () => {
			const short = { ...video, trimStartSec: 0, durationSec: 5 };
			expect(trimEdge(short, "end", 0, 8).durationSec).toBe(8);
			expect(trimEdge(short, "end", -1, 8).durationSec).toBe(8);
			expect(trimEdge(short, "end", 1, 8).durationSec).toBe(9);
			expect(trimEdge(short, "start", 1, 8)).toEqual({
				trimStartSec: 0,
				durationSec: 8,
			});
		});

		it("never goes under the minimum, however short the floor", () => {
			expect(trimEdge(scene, "end", -50, 0.3).durationSec).toBe(1);
			expect(trimEdge(scene, "start", 50, 0.3).durationSec).toBe(1);
		});

		it("still keeps the in-point inside the media", () => {
			expect(trimEdge(extended, "start", 50, 4)).toEqual({
				trimStartSec: 9,
				durationSec: 23,
			});
		});
	});
});

describe("trimTimestamps", () => {
	it("counts words from the trim start and drops the ones cut before it", () => {
		expect(
			trimTimestamps([toCaption("cut", 0, 1), toCaption("kept", 1.5, 2)], {
				trimStartSec: 1.25,
				durationSec: 10,
			}),
		).toEqual([toCaption("kept", 0.25, 0.75)]);
	});

	it("drops a word the cut lands in, so no word starts before the clip", () => {
		expect(
			trimTimestamps(
				[toCaption("halved", 0.2, 0.6), toCaption("kept", 1, 1.5)],
				{ trimStartSec: 0.3, durationSec: 10 },
			),
		).toEqual([toCaption("kept", 0.7, 1.2)]);
	});

	it("drops the words the end trim cuts or leaves out", () => {
		expect(
			trimTimestamps(
				[
					toCaption("kept", 0, 1),
					toCaption("halved", 1.5, 2.5),
					toCaption("after", 3, 4),
				],
				{ trimStartSec: 0, durationSec: 2 },
			),
		).toEqual([toCaption("kept", 0, 1)]);
	});
});
