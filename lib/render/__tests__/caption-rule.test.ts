import { describe, expect, it } from "vitest";
import { CONTENT_TYPES, type ContentType } from "@/lib/canvas/types";
import { toCaption } from "@/lib/captions/word-captions";
import { layoutCaptions } from "../caption-rule";
import type { Caption } from "@remotion/captions";
import type { RenderLayout, ResolvedElement } from "../types";
import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { layoutOf } from "./_layout";

function el(
	id: string,
	type: ContentType,
	captions?: Caption[],
	durationSec = 10,
): ResolvedElement {
	const { role, layer } = CONTENT_TYPES[type];
	return {
		id,
		type,
		role,
		layer,
		sceneId: "s1",
		sceneNumber: 1,
		prompt: "",
		url: `https://example.com/${id}`,
		trimDurationSec: durationSec,
		mediaDurationSec: durationSec,
		trimStartSec: 0,
		loops: 1,
		loop: false,
		volume: 10,
		motion: "none",
		captions,
	};
}

const heard: Caption[] = [toCaption("hi", 0, 1)];

describe("layoutCaptions", () => {
	const spans = (layout: RenderLayout) =>
		layoutCaptions(layout).map(({ element, start, duration }) => ({
			id: element.id,
			start,
			duration,
		}));

	it("lays no captions while captions are off", () => {
		expect(
			layoutCaptions(
				layoutOf([el("vid", "video", heard)], { captions: false }),
			),
		).toEqual([]);
	});

	it("ends the last line with its last word", () => {
		expect(spans(layoutOf([el("vid", "video", heard)]))).toEqual([
			{ id: "vid", start: 0, duration: 1 },
		]);
	});

	describe("with a word a line", () => {
		const paused: Caption[] = [toCaption("one", 0, 1), toCaption("two", 3, 4)];
		const wordPerLine = (element: ResolvedElement) =>
			layoutOf([element], {
				captionStyle: {
					...VideoSettingsSchema.parse({}).captionStyle,
					lineMs: 0,
				},
			});

		it("holds a line through a pause until the next line starts", () => {
			expect(spans(wordPerLine(el("vid", "video", paused)))).toEqual([
				{ id: "vid", start: 0, duration: 3 },
				{ id: "vid", start: 3, duration: 1 },
			]);
		});
	});

	it("captions the speech instead of a video when its scene's speech has words", () => {
		expect(
			spans(
				layoutOf([el("vid", "video", heard), el("nar", "speech", heard)]),
			).map(({ id }) => id),
		).toEqual(["nar"]);
	});

	it("keeps a video's captions while its scene's speech has no words", () => {
		expect(
			spans(layoutOf([el("vid", "video", heard), el("nar", "speech")])).map(
				({ id }) => id,
			),
		).toEqual(["vid"]);
	});

	it("keeps a video's captions when the speech is in another scene", () => {
		const speech = { ...el("nar", "speech", heard), sceneId: "s2" };
		expect(
			spans(layoutOf([el("vid", "video", heard), speech])).map(({ id }) => id),
		).toEqual(["vid", "nar"]);
	});

	it("lays out a music track's captions", () => {
		expect(
			spans(layoutOf([el("song", "music", heard), el("img", "image")])),
		).toEqual([{ id: "song", start: 0, duration: 1 }]);
	});

	it("shows only the words inside the trim, timed from its start", () => {
		const words = [toCaption("one", 0, 1), toCaption("two", 2, 3)];
		const trimmed = {
			...el("vid", "video", words, 3),
			trimStartSec: 1.5,
			trimDurationSec: 1.5,
		};
		expect(spans(layoutOf([trimmed]))).toEqual([
			{ id: "vid", start: 0.5, duration: 1 },
		]);
	});

	it("drops a track's words past where the next track cuts it", () => {
		const song: Caption[] = [
			toCaption("early", 0, 1),
			toCaption("straddles", 9.5, 10.5),
			toCaption("late", 15, 16),
		];
		expect(
			spans(
				layoutOf([
					el("songA", "music", song, 30),
					el("vid", "video"),
					el("songB", "music", undefined, 30),
					el("vid2", "video"),
				]),
			),
		).toEqual([{ id: "songA", start: 0, duration: 1 }]);
	});
});
