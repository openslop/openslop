import { describe, expect, it } from "vitest";
import {
	DEFAULT_VIDEO_LENGTH,
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
	WORDS_PER_SPOKEN_ELEMENT,
	resolveVideoLength,
	resolveVideoLengthSpec,
} from "../videoLength";

describe("resolveVideoLength", () => {
	it("falls back to the default when no length is set", () => {
		expect(resolveVideoLength({})).toBe(DEFAULT_VIDEO_LENGTH);
		expect(resolveVideoLength({ videoSettings: {} })).toBe(
			DEFAULT_VIDEO_LENGTH,
		);
	});

	it("returns the selected length", () => {
		expect(resolveVideoLength({ videoSettings: { length: "10-15m" } })).toBe(
			"10-15m",
		);
	});
});

describe("VIDEO_LENGTH_SPECS", () => {
	it("translates each runtime into a spoken word budget at 180 wpm", () => {
		expect(VIDEO_LENGTH_SPECS["under-30s"]).toMatchObject({
			minWords: 50,
			maxWords: 90,
		});
		expect(VIDEO_LENGTH_SPECS["10-15m"]).toMatchObject({
			minWords: 1800,
			maxWords: 2700,
		});
	});

	it("splits the budget into countable elements of a natural line length", () => {
		expect(VIDEO_LENGTH_SPECS["10-15m"]).toMatchObject({
			minElements: 60,
			maxElements: 90,
		});
	});

	it("gives every length an ascending budget", () => {
		for (const length of VIDEO_LENGTHS) {
			const { minWords, maxWords, minElements, maxElements, label } =
				VIDEO_LENGTH_SPECS[length];
			expect(label).not.toBe("");
			expect(minWords).toBeLessThan(maxWords);
			expect(minElements).toBeLessThan(maxElements);
			expect(minElements).toBeGreaterThan(0);
		}
	});

	// Integer rounding dominates the short presets, where a preset is only 2 elements.
	it("keeps every element near the natural line length", () => {
		for (const length of VIDEO_LENGTHS) {
			const { minWords, minElements } = VIDEO_LENGTH_SPECS[length];
			const wordsPerElement = minWords / minElements;
			expect(wordsPerElement).toBeGreaterThan(WORDS_PER_SPOKEN_ELEMENT / 2);
			expect(wordsPerElement).toBeLessThan(WORDS_PER_SPOKEN_ELEMENT * 1.5);
		}
	});

	it("resolves metadata straight to a spec", () => {
		expect(resolveVideoLengthSpec({ videoSettings: { length: "3-5m" } })).toBe(
			VIDEO_LENGTH_SPECS["3-5m"],
		);
	});
});
