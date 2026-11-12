import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { estimateVisualSpans, type VisualSpan } from "../visual-spans";
import {
	DURATION_FIT_LEEWAY_SEC,
	durationFits,
	fallsShort,
} from "../duration-fit";
import { at } from "@/lib/utils";

const span = (over: Partial<VisualSpan> = {}): VisualSpan => ({
	id: "e1",
	type: "video",
	sceneNumber: 1,
	words: 30,
	dialogueIds: ["n1"],
	durationSec: 10,
	...over,
});

describe("durationFits", () => {
	it("leaves out a video with no dialogue under it, which plays its own length", () => {
		expect(durationFits([span({ words: 0, dialogueIds: [] })])).toEqual([]);
	});

	it("covers the dialogue under a video, plus the leeway", () => {
		const fit = at(durationFits([span({ words: 30 })]), 0);

		expect(fit.needed).toBe(10 + DURATION_FIT_LEEWAY_SEC);
		expect(fit.duration).toBe(11);
		expect(fallsShort(fit)).toBe(false);
	});

	it("snaps up to a whole option rather than under-covering", () => {
		expect(durationFits([span({ words: 20 })])[0]?.duration).toBe(8);
	});

	it("holds the longest option and reports that it falls short", () => {
		const fit = at(durationFits([span({ words: 120 })]), 0);

		expect(fit.duration).toBe(15);
		expect(fallsShort(fit)).toBe(true);
	});

	it("leaves stills out, since they carry no duration and already stretch", () => {
		expect(
			durationFits([span({ type: "image", durationSec: undefined })]),
		).toEqual([]);
	});
});

const words = (count: number) => Array(count).fill("word").join(" ");

const node = (
	id: string,
	type: "video" | "narration",
	text: string,
	generationAttributes?: Record<string, string>,
) => ({
	id,
	type,
	generationAttributes,
	children: [{ id: `${id}-t`, text }],
});

describe("durationFits over an estimated canvas", () => {
	it("fits a video to the dialogue that runs on past the scene it sits in", () => {
		const script = [
			{
				id: "s1",
				type: "scene",
				children: [
					node("video1", "video", "A pan.", { duration: "4" }),
					node("n1", "narration", words(15)),
				],
			},
			{
				id: "s2",
				type: "scene",
				children: [node("n2", "narration", words(15))],
			},
		] as unknown as Descendant[];

		const [fit] = durationFits(estimateVisualSpans(script));

		expect(fit?.span.id).toBe("video1");
		expect(fit?.duration).toBe(11);
	});
});
