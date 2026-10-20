import { describe, expect, it } from "vitest";
import {
	isTrimmable,
	isTrimmed,
	playedSec,
	trimClip,
	trimEdge,
	trimTimestamps,
} from "../clip-trim";

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
		const extended = { ...video, trimStartSec: 2, durationSec: 30 };
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
});

describe("trimTimestamps", () => {
	it("counts words from the trim start and drops the ones cut before it", () => {
		expect(
			trimTimestamps(
				[
					{ text: "cut", start: 0, end: 1 },
					{ text: "kept", start: 1.5, end: 2 },
				],
				1.25,
			),
		).toEqual([{ text: "kept", start: 0.25, end: 0.75 }]);
	});
});
