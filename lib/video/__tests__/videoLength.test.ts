import { describe, expect, it } from "vitest";
import { VIDEO_LENGTHS, VIDEO_LENGTH_SPECS } from "../videoLength";

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

	it("gives every length an ascending budget", () => {
		for (const length of VIDEO_LENGTHS) {
			const { minWords, maxWords, label } = VIDEO_LENGTH_SPECS[length];
			expect(label).not.toBe("");
			expect(minWords).toBeLessThan(maxWords);
		}
	});
});
