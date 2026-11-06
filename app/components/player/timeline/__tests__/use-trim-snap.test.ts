import { describe, expect, it } from "vitest";
import { CONTENT_TYPES, type ContentType } from "@/lib/canvas/types";
import type { RenderLayout, ResolvedElement } from "@/lib/render/types";
import { layoutOf } from "@/lib/render/__tests__/_layout";
import { buildTimelineRows } from "../timeline-rows";
import { snapEdges } from "../use-trim-snap";

const el = (
	id: string,
	type: ContentType,
	overrides: Partial<ResolvedElement>,
): ResolvedElement => ({
	id,
	type,
	role: CONTENT_TYPES[type].role,
	layer: CONTENT_TYPES[type].layer,
	sceneId: "s1",
	sceneNumber: 1,
	prompt: "",
	url: `https://example.com/${id}`,
	trimDurationSec: 4,
	mediaDurationSec: 0,
	trimStartSec: 0,
	loops: 1,
	loop: false,
	volume: 10,
	motion: "none",
	...overrides,
});

describe("snapEdges", () => {
	const secsOf = (layout: RenderLayout, id: string) =>
		new Set(
			snapEdges(buildTimelineRows(layout))
				.filter((edge) => edge.elementId === id)
				.map((edge) => edge.sec),
		);

	it("marks where each clip starts and ends", () => {
		const layout = layoutOf([
			el("img", "image", { trimDurationSec: 5 }),
			el("n1", "narration", { trimDurationSec: 3 }),
		]);
		expect(secsOf(layout, "img")).toEqual(new Set([0, 5]));
		expect(secsOf(layout, "n1")).toEqual(new Set([0, 3]));
	});

	it("marks where a video's media stops as well as where its scene ends", () => {
		const layout = layoutOf([
			el("v", "video", { mediaDurationSec: 10, trimDurationSec: 4 }),
			el("n1", "narration", { trimDurationSec: 6 }),
		]);
		expect(secsOf(layout, "v")).toEqual(new Set([0, 4, 6]));
	});
});
