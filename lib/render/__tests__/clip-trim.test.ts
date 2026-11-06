import { describe, expect, it } from "vitest";
import {
	isTrimmable,
	isTrimmed,
	extensionSec,
	laidOut,
	trimClip,
	trimEdge,
	trimCaptions,
} from "../clip-trim";
import { toCaption } from "@/lib/captions/word-captions";
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
	trimDurationSec: 10,
	mediaDurationSec: 10,
	trimStartSec: 0,
	loops: 1,
	loop: false,
	volume: 10,
	motion: "none",
	...over,
});

describe("isTrimmable", () => {
	it("trims only what has a media length", () => {
		expect(isTrimmable(el({ mediaDurationSec: 5 }))).toBe(true);
		expect(isTrimmable(el({ mediaDurationSec: 0 }))).toBe(false);
	});
});

describe("isTrimmed", () => {
	it("is trimmed once it opens late or ends early", () => {
		expect(isTrimmed(el({}))).toBe(false);
		expect(isTrimmed(el({ trimStartSec: 1, trimDurationSec: 9 }))).toBe(true);
		expect(isTrimmed(el({ trimDurationSec: 4 }))).toBe(true);
	});

	it("is never trimmed without media, like a still or the blank opener", () => {
		expect(isTrimmed(el({ trimDurationSec: 4, mediaDurationSec: 0 }))).toBe(
			false,
		);
	});
});

describe("trimClip", () => {
	it("plays from its trim start to the end of its media", () => {
		expect(trimClip(10, 3)).toEqual({
			trimStartSec: 3,
			trimDurationSec: 7,
		});
	});

	it("cuts at its trim duration", () => {
		expect(trimClip(10, 2, 4).trimDurationSec).toBe(4);
	});

	it("resolves a trim duration stored past the media to the media's end", () => {
		expect(trimClip(10, 2, 20).trimDurationSec).toBe(8);
	});

	it("keeps a trim start inside the media, at least the minimum from its end", () => {
		expect(trimClip(10, 50).trimStartSec).toBe(9);
	});
});

describe("trimEdge", () => {
	const clip = el({ trimStartSec: 2, trimDurationSec: 5 });

	it("lengthens and shortens from the end, keeping the start", () => {
		expect(trimEdge(clip, "end", -2)).toEqual({
			trimStartSec: 2,
			trimDurationSec: 3,
		});
		expect(trimEdge(clip, "end", 1)).toEqual({
			trimStartSec: 2,
			trimDurationSec: 6,
		});
	});

	it("stops the end at the media's last frame and at the minimum", () => {
		expect(trimEdge(clip, "end", 50).trimDurationSec).toBe(8);
		expect(trimEdge(clip, "end", -50).trimDurationSec).toBe(1);
	});

	it("stops the end at the last frame from the in-point, not from the media's start", () => {
		expect(
			trimEdge({ ...clip, trimStartSec: 6 }, "end", 50).trimDurationSec,
		).toBe(4);
	});

	it("moves the in-point with the start edge, shortening the clip as much", () => {
		expect(trimEdge(clip, "start", 1)).toEqual({
			trimStartSec: 3,
			trimDurationSec: 4,
		});
		expect(trimEdge(clip, "start", -1)).toEqual({
			trimStartSec: 1,
			trimDurationSec: 6,
		});
	});

	it("leaves a clip shorter than the minimum as it is when neither edge moves", () => {
		const trim = { trimStartSec: 0, trimDurationSec: 0.5 };
		const short = el({ ...trim, mediaDurationSec: 0.5 });
		expect(trimEdge(short, "end", 0)).toEqual(trim);
		expect(trimEdge(short, "start", 0)).toEqual(trim);
		expect(trimEdge(short, "end", 5)).toEqual(trim);
	});

	it("uncovers no more than was trimmed off, and keeps the minimum", () => {
		expect(trimEdge(clip, "start", -50)).toEqual({
			trimStartSec: 0,
			trimDurationSec: 7,
		});
		expect(trimEdge(clip, "start", 50)).toEqual({
			trimStartSec: 6,
			trimDurationSec: 1,
		});
	});
});

describe("trimCaptions", () => {
	it("counts words from the trim start and drops the ones cut before it", () => {
		expect(
			trimCaptions([toCaption("cut", 0, 1), toCaption("kept", 1.5, 2)], {
				trimStartSec: 1.25,
				trimDurationSec: 10,
			}),
		).toEqual({ trimIndexOffset: 1, words: [toCaption("kept", 0.25, 0.75)] });
	});

	it("drops a word the cut lands in, so no word starts before the clip", () => {
		expect(
			trimCaptions([toCaption("halved", 0.2, 0.6), toCaption("kept", 1, 1.5)], {
				trimStartSec: 0.3,
				trimDurationSec: 10,
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
				{ trimStartSec: 0, trimDurationSec: 2 },
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
				{ trimStartSec: 1, trimDurationSec: 1 },
			),
		).toEqual({ trimIndexOffset: 1, words: [toCaption("kept", 0, 1)] });
	});
});

describe("extensionSec", () => {
	const trimmedTo = (trimDurationSec: number) => ({
		trimStartSec: 0,
		trimDurationSec,
	});
	const scene = { overlaySec: 8 };

	it("has none outside a scene's dialogue", () => {
		expect(extensionSec({}, trimmedTo(3))).toBe(0);
	});

	it("extends the scene past a video trimmed under its dialogue", () => {
		expect(extensionSec(scene, trimmedTo(3))).toBe(5);
	});

	it("has none once the video outruns its dialogue", () => {
		expect(extensionSec(scene, trimmedTo(10))).toBe(0);
	});
});

describe("laidOut", () => {
	const music = el({ trimDurationSec: 60, mediaDurationSec: 60 });

	it("stretches a still across its whole span", () => {
		const still = el({
			type: "image",
			mediaDurationSec: 0,
			trimDurationSec: 0,
		});
		expect(laidOut({ element: still, duration: 8 }).trimDurationSec).toBe(8);
	});

	it("draws a sound the layout pads at its own length", () => {
		const sound = el({ trimDurationSec: 0.5 });
		expect(laidOut({ element: sound, duration: 1 }).trimDurationSec).toBe(0.5);
	});

	it("runs a clip the layout cuts short only as far as it's drawn", () => {
		expect(laidOut({ element: music, duration: 30 }).trimDurationSec).toBe(30);
	});

	it("keeps the trim of a clip the layout gives as much room or more", () => {
		expect(laidOut({ element: music, duration: 80 }).trimDurationSec).toBe(60);
	});

	it("trims a cut clip's end from where it's drawn, not past the cut", () => {
		const cut = laidOut({ element: music, duration: 30 });
		expect(trimEdge(cut, "end", -10).trimDurationSec).toBe(20);
	});
});
