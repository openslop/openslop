import { describe, expect, it } from "vitest";
import { CONTENT_TYPES, type ContentType } from "@/lib/canvas/types";
import { toCaption } from "@/lib/captions/word-captions";
import { captionableSequences, layoutCaptions } from "../caption-rule";
import type { RenderLayout, ResolvedCaptions, ResolvedElement } from "../types";
import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { layoutOf } from "./_layout";

function el(
	id: string,
	type: ContentType,
	captions?: ResolvedCaptions,
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
		durationSec,
		mediaDurationSec: durationSec,
		trimStartSec: 0,
		loops: 1,
		loop: false,
		volume: 10,
		motion: "none",
		captions,
	};
}

const heard: ResolvedCaptions = {
	firstWordIndex: 0,
	words: [toCaption("hi", 0, 1)],
};

describe("layoutCaptions", () => {
	const spans = (layout: RenderLayout) =>
		layoutCaptions(layout).map(({ element, start, duration }) => ({
			id: element.id,
			start,
			duration,
		}));

	it("lays a line out while its words are spoken, and drops it once they end", () => {
		expect(spans(layoutOf([el("vid", "video", heard)]))).toEqual([
			{ id: "vid", start: 0, duration: 1 },
		]);
	});

	describe("with a word a line", () => {
		const paused: ResolvedCaptions = {
			firstWordIndex: 0,
			words: [toCaption("one", 0, 1), toCaption("two", 3, 4)],
		};
		const wordPerLine = (element: ResolvedElement) =>
			layoutOf([element], {
				captionStyle: {
					...VideoSettingsSchema.parse({}).captionStyle,
					lineMs: 0,
				},
			});

		it("drops a line once its last word ends, even before the next line starts", () => {
			expect(spans(wordPerLine(el("vid", "video", paused)))).toEqual([
				{ id: "vid", start: 0, duration: 1 },
				{ id: "vid", start: 3, duration: 1 },
			]);
		});

		it("drops lines that start after the clip ends", () => {
			expect(spans(wordPerLine(el("vid", "video", paused, 2)))).toEqual([
				{ id: "vid", start: 0, duration: 1 },
			]);
		});
	});

	it("stops captions where the next scene begins, and the last scene's where it ends", () => {
		const spoken: ResolvedCaptions = {
			firstWordIndex: 0,
			words: [toCaption("hi", 0, 12)],
		};
		const layout = layoutOf(
			[el("vid", "video", spoken), el("vid2", "video", spoken)],
			{ transitionType: "fade" },
		);
		const [first, last] = layout.series;
		const [firstLine, lastLine] = layoutCaptions(layout);
		expect(firstLine.duration).toBeCloseTo(
			first.duration - layout.transitionDurationSec,
		);
		expect(lastLine.start).toBe(last.start);
		expect(lastLine.duration).toBe(last.duration);
	});

	it("captions the speech instead of a video when its scene's speech has words", () => {
		expect(
			spans(
				layoutOf([el("vid", "video", heard), el("nar", "narration", heard)]),
			).map(({ id }) => id),
		).toEqual(["nar"]);
	});

	it("keeps a video's captions while its scene's speech has no words", () => {
		expect(
			spans(layoutOf([el("vid", "video", heard), el("nar", "narration")])).map(
				({ id }) => id,
			),
		).toEqual(["vid"]);
	});

	it("keeps a video's captions when the speech is in another scene", () => {
		const speech = { ...el("nar", "narration", heard), sceneId: "s2" };
		expect(
			spans(layoutOf([el("vid", "video", heard), speech])).map(({ id }) => id),
		).toEqual(["vid", "nar"]);
	});

	it("drops a line too short to cover a frame", () => {
		expect(layoutCaptions(layoutOf([el("vid", "video", heard, 0.01)]))).toEqual(
			[],
		);
	});
});

describe("captionableSequences", () => {
	const ids = (layout: RenderLayout) =>
		captionableSequences(layout).map(({ element }) => element.id);

	it("needs no captions on a video whose scene has speech", () => {
		expect(ids(layoutOf([el("vid", "video"), el("nar", "narration")]))).toEqual(
			["nar"],
		);
	});

	it("captions a video with no speech in its scene", () => {
		expect(ids(layoutOf([el("vid", "video")]))).toEqual(["vid"]);
	});
});
