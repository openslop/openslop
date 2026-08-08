import { describe, expect, it } from "vitest";
import {
	DEFAULT_VIDEO_LENGTH,
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
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
	it("translates each runtime into a spoken word budget at 150 wpm", () => {
		expect(VIDEO_LENGTH_SPECS["under-30s"]).toMatchObject({
			minWords: 40,
			maxWords: 80,
		});
		expect(VIDEO_LENGTH_SPECS["10-15m"]).toMatchObject({
			minWords: 1500,
			maxWords: 2250,
		});
	});

	it("gives every length an ascending budget", () => {
		for (const length of VIDEO_LENGTHS) {
			const { minWords, maxWords, label } = VIDEO_LENGTH_SPECS[length];
			expect(label).not.toBe("");
			expect(minWords).toBeLessThan(maxWords);
		}
	});

	it("resolves metadata straight to a spec", () => {
		expect(resolveVideoLengthSpec({ videoSettings: { length: "3-5m" } })).toBe(
			VIDEO_LENGTH_SPECS["3-5m"],
		);
	});
});
