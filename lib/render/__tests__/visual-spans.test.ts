import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import {
	EMPTY_SNAPSHOT,
	type ElementSnapshot,
} from "@/lib/generation/snapshots";
import { estimateVisualSpans } from "../visual-spans";
import { element, scene, words } from "./_script";

const spansOf = (
	script: Descendant[],
	held: Record<string, ElementSnapshot> = {},
) => estimateVisualSpans(script, (id) => held[id] ?? EMPTY_SNAPSHOT);

describe("estimateVisualSpans", () => {
	it("gives a visual the dialogue that follows it, up to the next visual", () => {
		const image = element("image", "A forest.");
		const narration = element("narration", words(90));
		const next = element("image", "A clearing.");

		const [first, second] = spansOf([
			scene(image, narration, next, element("narration", words(180))),
		]);

		expect(first).toMatchObject({
			id: image.id,
			words: 90,
			dialogueIds: [narration.id],
		});
		expect(second.words).toBe(180);
	});

	it("counts dialogue across scene boundaries, since only a visual ends a span", () => {
		const image = element("image", "A forest.");

		const [only] = spansOf([
			scene(image, element("narration", words(90))),
			scene(element("character", words(90))),
		]);

		expect(only).toMatchObject({ words: 180, sceneNumber: 1 });
	});

	it("carries a video's duration, and none for a still", () => {
		const [video, still] = spansOf([
			scene(
				element("video", "A pan.", { duration: "8", trimEnd: "5" }),
				element("image", "A forest."),
			),
		]);

		expect(video.durationSec).toBe(8);
		expect(still.durationSec).toBeUndefined();
	});

	it("carries no duration for an uploaded video, which keeps its own length", () => {
		const upload = element("video", "", { duration: "5" });

		const [span] = spansOf([scene(upload, element("narration", words(90)))], {
			[upload.id]: {
				...EMPTY_SNAPSHOT,
				result: { videoUrl: "https://example.com/clip.mp4", durationSec: 60 },
				pinned: true,
			},
		});

		expect(span.durationSec).toBeUndefined();
	});

	it("ignores silent elements and dialogue before the first visual", () => {
		const image = element("image", "A forest.");

		const spans = spansOf([
			scene(
				element("narration", words(180)),
				image,
				element("music", "Soft piano."),
				element("sound", "Wind"),
			),
		]);

		expect(spans).toEqual([
			{
				id: image.id,
				type: "image",
				sceneNumber: 1,
				words: 0,
				dialogueIds: [],
			},
		]);
	});

	it("estimates an empty canvas as nothing", () => {
		expect(spansOf([])).toEqual([]);
	});
});
