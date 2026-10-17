import { describe, expect, it } from "vitest";
import {
	isLengthLocked,
	isTrimmed,
	trimClip,
	trimEdge,
	trimTimestamps,
} from "../clip-trim";

describe("isLengthLocked", () => {
	it("locks a visual trimmed to its dialogue, and nothing else", () => {
		expect(isLengthLocked({ layer: "visual", trimToDialogue: true })).toBe(
			true,
		);
		expect(isLengthLocked({ layer: "visual", trimToDialogue: false })).toBe(
			false,
		);
		expect(isLengthLocked({ layer: "audio", trimToDialogue: true })).toBe(
			false,
		);
	});
});

describe("isTrimmed", () => {
	it("is trimmed once it opens late or ends early", () => {
		const full = { trimStartSec: 0, durationSec: 10, mediaDurationSec: 10 };
		expect(isTrimmed(full)).toBe(false);
		expect(isTrimmed({ ...full, trimStartSec: 1 })).toBe(true);
		expect(isTrimmed({ ...full, durationSec: 4 })).toBe(true);
	});
});

describe("trimClip", () => {
	it("plays from its trim start to the end of its media", () => {
		expect(trimClip(10, 3)).toEqual({ trimStartSec: 3, durationSec: 7 });
	});

	it("cuts at its timeline duration, but never past its media", () => {
		expect(trimClip(10, 2, 4).durationSec).toBe(4);
		expect(trimClip(10, 2, 20).durationSec).toBe(8);
	});

	it("keeps a trim start inside the media, at least the minimum from its end", () => {
		expect(trimClip(10, 50).trimStartSec).toBe(9);
	});
});

describe("trimEdge", () => {
	const clip = { trimStartSec: 2, durationSec: 5, mediaDurationSec: 10 };

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

	it("stops the end at its media and at the minimum", () => {
		expect(trimEdge(clip, "end", 50).durationSec).toBe(8);
		expect(trimEdge(clip, "end", -50).durationSec).toBe(1);
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
