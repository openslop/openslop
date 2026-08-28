import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import type { ElementLength } from "../elementLengths";
import { measureElementLengths } from "../elementLengths";
import { DEFAULT_TRIM_VISUALS_TO_DIALOGUE } from "../scene-builder";
import {
	DURATION_FIT_LEEWAY_SEC,
	durationFits,
	fallsShort,
} from "../durationFit";

const length = (over: Partial<ElementLength> = {}): ElementLength => ({
	id: "e1",
	type: "animated_image",
	sceneNumber: 1,
	seconds: 10,
	words: 30,
	dialogueIds: ["n1"],
	durationSec: 10,
	...over,
});

describe("durationFits", () => {
	it("covers the dialogue under a clip, plus the leeway", () => {
		const [fit] = durationFits([length({ words: 30 })]);

		expect(fit.needed).toBe(10 + DURATION_FIT_LEEWAY_SEC);
		expect(fit.duration).toBe(11);
		expect(fallsShort(fit)).toBe(false);
	});

	it("snaps up to a whole option rather than under-covering", () => {
		expect(durationFits([length({ words: 20 })])[0].duration).toBe(8);
	});

	it("holds the shortest option when there is no dialogue at all", () => {
		expect(durationFits([length({ words: 0 })])[0].duration).toBe(4);
	});

	it("holds the longest option and reports that it falls short", () => {
		const [fit] = durationFits([length({ words: 120 })]);

		expect(fit.duration).toBe(15);
		expect(fallsShort(fit)).toBe(true);
	});

	it("leaves stills out, since they carry no duration and already stretch", () => {
		expect(
			durationFits([length({ type: "image", durationSec: undefined })]),
		).toEqual([]);
	});
});

const words = (count: number) => Array(count).fill("word").join(" ");

const node = (
	id: string,
	type: "animated_image" | "narration",
	text: string,
	generationAttributes?: Record<string, string>,
) => ({
	id,
	type,
	generationAttributes,
	children: [{ id: `${id}-t`, type, text }],
});

describe("durationFits over a measured canvas", () => {
	it("fits a clip to the dialogue that runs on past the scene it sits in", () => {
		const script = [
			{
				id: "s1",
				type: "scene",
				children: [
					node("clip1", "animated_image", "A pan.", { duration: "4" }),
					node("n1", "narration", words(15)),
				],
			},
			{
				id: "s2",
				type: "scene",
				children: [node("n2", "narration", words(15))],
			},
		] as unknown as Descendant[];

		const [fit] = durationFits(
			measureElementLengths(script, DEFAULT_TRIM_VISUALS_TO_DIALOGUE),
		);

		expect(fit.length.id).toBe("clip1");
		expect(fit.duration).toBe(11);
	});
});
