import { describe, expect, it } from "vitest";
import type { Descendant } from "slate";
import { splitAttributes } from "@/lib/video/elementAttributes";
import type { ElementLength } from "../elementLengths";
import { measureElementLengths } from "../elementLengths";
import { DEFAULT_TRIM_VISUALS_TO_DIALOGUE } from "../scene-builder";
import { DURATION_FIT_LEEWAY_SEC, durationFits } from "../durationFit";

const length = (over: Partial<ElementLength> = {}): ElementLength => ({
	id: "e1",
	type: "animated_image",
	sceneNumber: 1,
	seconds: 10,
	dialogueSec: 10,
	words: 30,
	dialogueIds: ["n1"],
	durationSec: 10,
	...over,
});

describe("durationFits", () => {
	it("covers the dialogue under a clip, plus the leeway", () => {
		const [fit] = durationFits([length({ dialogueSec: 10 })]);

		expect(fit.needed).toBe(10 + DURATION_FIT_LEEWAY_SEC);
		expect(fit.duration).toBe(11);
		expect(fit.short).toBe(false);
	});

	it("rounds up to a whole option rather than under-covering", () => {
		expect(durationFits([length({ dialogueSec: 6.7 })])[0].duration).toBe(8);
	});

	it("holds the shortest option when there is no dialogue at all", () => {
		expect(durationFits([length({ dialogueSec: 0 })])[0].duration).toBe(4);
	});

	it("clamps to the longest option and flags that it falls short", () => {
		const [fit] = durationFits([length({ dialogueSec: 40 })]);

		expect(fit.duration).toBe(15);
		expect(fit.short).toBe(true);
	});

	it("leaves stills out, since they carry no duration and already stretch", () => {
		expect(
			durationFits([length({ type: "image", durationSec: undefined })]),
		).toEqual([]);
	});
});

let nextId = 0;
const element = (
	type: "animated_image" | "narration",
	text: string,
	customAttributes?: Record<string, string>,
) => {
	const id = `e${nextId++}`;
	return {
		id,
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: `${id}-t`, type, text }],
	};
};

const scene = (...children: ReturnType<typeof element>[]): Descendant =>
	({ id: `s${nextId++}`, type: "scene", children }) as unknown as Descendant;

const words = (count: number) => Array(count).fill("word").join(" ");

describe("durationFits over a measured canvas", () => {
	it("fits a clip to the dialogue that runs past the scene it sits in", () => {
		const clip = element("animated_image", "A pan.", { duration: "4" });

		const [fit] = durationFits(
			measureElementLengths(
				[
					scene(clip, element("narration", words(15))),
					scene(element("narration", words(15))),
				],
				DEFAULT_TRIM_VISUALS_TO_DIALOGUE,
			),
		);

		expect(fit.length.id).toBe(clip.id);
		expect(fit.duration).toBe(11);
	});
});
