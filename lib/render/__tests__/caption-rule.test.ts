import { describe, expect, it } from "vitest";
import { CONTENT_TYPES, type ContentType } from "@/lib/canvas/types";
import { caption } from "@/lib/captions/__tests__/_captions";
import { captionableSequences, layoutCaptions } from "../caption-rule";
import type { RenderLayout, ResolvedCaptions, ResolvedElement } from "../types";
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
	words: [caption("hi", 0, 1)],
};

describe("layoutCaptions", () => {
	const spans = (layout: RenderLayout) =>
		layoutCaptions(layout).map(({ element, start, duration }) => ({
			id: element.id,
			start,
			duration,
		}));

	it("lays a line out where its element plays", () => {
		expect(spans(layoutOf([el("vid", "video", heard)]))).toEqual([
			{ id: "vid", start: 0, duration: 10 },
		]);
	});

	it("stops captions where the next scene begins, and holds the last scene's to its end", () => {
		const layout = layoutOf(
			[el("vid", "video", heard), el("vid2", "video", heard)],
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
