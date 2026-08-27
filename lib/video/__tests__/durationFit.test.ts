import { describe, expect, it } from "vitest";
import type { ElementLength } from "../elementLengths";
import { DURATION_FIT_LEEWAY_SEC, durationFits } from "../durationFit";

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

		expect(fit.dialogue).toBe(10);
		expect(fit.needed).toBe(10 + DURATION_FIT_LEEWAY_SEC);
		expect(fit.duration).toBe(11);
		expect(fit.short).toBe(false);
	});

	it("rounds up to a whole option rather than under-covering", () => {
		expect(durationFits([length({ words: 20 })])[0].duration).toBe(8);
	});

	it("holds the shortest option when there is no dialogue at all", () => {
		expect(durationFits([length({ words: 0 })])[0].duration).toBe(4);
	});

	it("clamps to the longest option and flags that it falls short", () => {
		const [fit] = durationFits([length({ words: 120 })]);

		expect(fit.duration).toBe(15);
		expect(fit.short).toBe(true);
	});

	it("leaves stills out, since they carry no duration and already stretch", () => {
		expect(
			durationFits([length({ type: "image", durationSec: undefined })]),
		).toEqual([]);
	});
});
