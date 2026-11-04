import { describe, expect, it } from "vitest";
import {
	isTrimmable,
	isTrimmed,
	previewSpan,
	trimClip,
	trimEdge,
	trimCaptions,
} from "../clip-trim";
import { toCaption } from "@/lib/captions/word-captions";

describe("isTrimmable", () => {
	it("trims only what has a media length", () => {
		expect(isTrimmable({ originalDurationSec: 5 })).toBe(true);
		expect(isTrimmable({ originalDurationSec: 0 })).toBe(false);
	});
});

describe("isTrimmed", () => {
	it("is trimmed once it opens late, ends early or runs long", () => {
		const full = {
			trimStartSec: 0,
			timelineDurationSec: 10,
			originalDurationSec: 10,
		};
		expect(isTrimmed(full)).toBe(false);
		expect(isTrimmed({ ...full, trimStartSec: 1 })).toBe(true);
		expect(isTrimmed({ ...full, timelineDurationSec: 4 })).toBe(true);
		expect(isTrimmed({ ...full, timelineDurationSec: 12 })).toBe(true);
	});

	it("is never trimmed without media, like a still or the blank opener", () => {
		expect(
			isTrimmed({
				trimStartSec: 0,
				timelineDurationSec: 4,
				originalDurationSec: 0,
			}),
		).toBe(false);
	});
});

const media = { originalDurationSec: 10 };

describe("trimClip", () => {
	it("plays from its trim start to the end of its media", () => {
		expect(trimClip(media, 3)).toEqual({
			trimStartSec: 3,
			timelineDurationSec: 7,
		});
	});

	it("cuts at its timeline duration", () => {
		expect(trimClip(media, 2, 4).timelineDurationSec).toBe(4);
	});

	it("resolves a timeline duration stored past the media to the media's end", () => {
		expect(trimClip(media, 2, 20).timelineDurationSec).toBe(8);
	});

	it("keeps a trim start inside the media, at least the minimum from its end", () => {
		expect(trimClip(media, 50).trimStartSec).toBe(9);
	});
});

describe("trimEdge", () => {
	const clip = { ...media, trimStartSec: 2, timelineDurationSec: 5 };

	it("lengthens and shortens from the end, keeping the start", () => {
		expect(trimEdge(clip, "end", -2)).toEqual({
			trimStartSec: 2,
			timelineDurationSec: 3,
		});
		expect(trimEdge(clip, "end", 1)).toEqual({
			trimStartSec: 2,
			timelineDurationSec: 6,
		});
	});

	it("stops the end at the media's last frame and at the minimum", () => {
		expect(trimEdge(clip, "end", 50).timelineDurationSec).toBe(8);
		expect(trimEdge(clip, "end", -50).timelineDurationSec).toBe(1);
	});

	it("stops the end at the last frame from the in-point, not from the media's start", () => {
		expect(
			trimEdge({ ...clip, trimStartSec: 6 }, "end", 50).timelineDurationSec,
		).toBe(4);
	});

	it("moves the in-point with the start edge, shortening the clip as much", () => {
		expect(trimEdge(clip, "start", 1)).toEqual({
			trimStartSec: 3,
			timelineDurationSec: 4,
		});
		expect(trimEdge(clip, "start", -1)).toEqual({
			trimStartSec: 1,
			timelineDurationSec: 6,
		});
	});

	it("uncovers no more than was trimmed off, and keeps the minimum", () => {
		expect(trimEdge(clip, "start", -50)).toEqual({
			trimStartSec: 0,
			timelineDurationSec: 7,
		});
		expect(trimEdge(clip, "start", 50)).toEqual({
			trimStartSec: 6,
			timelineDurationSec: 1,
		});
	});
});

describe("trimCaptions", () => {
	it("counts words from the trim start and drops the ones cut before it", () => {
		expect(
			trimCaptions([toCaption("cut", 0, 1), toCaption("kept", 1.5, 2)], {
				trimStartSec: 1.25,
				timelineDurationSec: 10,
			}),
		).toEqual({ trimIndexOffset: 1, words: [toCaption("kept", 0.25, 0.75)] });
	});

	it("drops a word the cut lands in, so no word starts before the clip", () => {
		expect(
			trimCaptions([toCaption("halved", 0.2, 0.6), toCaption("kept", 1, 1.5)], {
				trimStartSec: 0.3,
				timelineDurationSec: 10,
			}),
		).toEqual({ trimIndexOffset: 1, words: [toCaption("kept", 0.7, 1.2)] });
	});

	it("drops the words the end trim cuts or leaves out", () => {
		expect(
			trimCaptions(
				[
					toCaption("kept", 0, 1),
					toCaption("halved", 1.5, 2.5),
					toCaption("after", 3, 4),
				],
				{ trimStartSec: 0, timelineDurationSec: 2 },
			),
		).toEqual({ trimIndexOffset: 0, words: [toCaption("kept", 0, 1)] });
	});

	it("places the kept words among the element's own whichever ends the trim cuts", () => {
		expect(
			trimCaptions(
				[
					toCaption("before", 0, 1),
					toCaption("kept", 1, 2),
					toCaption("after", 2, 3),
					toCaption("last", 3, 4),
				],
				{ trimStartSec: 1, timelineDurationSec: 1 },
			),
		).toEqual({ trimIndexOffset: 1, words: [toCaption("kept", 0, 1)] });
	});
});

describe("previewSpan", () => {
	const video = { originalDurationSec: 10 };
	const at = (timelineDurationSec: number) => ({
		trimStartSec: 0,
		timelineDurationSec,
	});

	it("shortens the clip with the trim when nothing runs past it", () => {
		expect(previewSpan(video, { duration: 5 }, at(5), at(3))).toEqual({
			timelineDurationSec: 3,
			extensionSec: 0,
		});
	});

	it("extends the scene past a video trimmed under its dialogue", () => {
		const scene = { duration: 8, overlaySec: 8 };
		expect(previewSpan(video, scene, at(5), at(3))).toEqual({
			timelineDurationSec: 3,
			extensionSec: 5,
		});
	});

	it("lengthens the scene once the video outruns its dialogue", () => {
		const scene = { duration: 8, overlaySec: 8 };
		expect(previewSpan(video, scene, at(5), at(10))).toEqual({
			timelineDurationSec: 10,
			extensionSec: 0,
		});
	});

	it("keeps the cross-fade the next scene cuts off", () => {
		expect(previewSpan(video, { duration: 4.5 }, at(5), at(5))).toEqual({
			timelineDurationSec: 4.5,
			extensionSec: 0,
		});
	});

	it("stretches a still across the whole scene", () => {
		const scene = { duration: 8, overlaySec: 8 };
		expect(
			previewSpan({ originalDurationSec: 0 }, scene, at(0), at(0)),
		).toEqual({ timelineDurationSec: 8, extensionSec: 0 });
	});
});
