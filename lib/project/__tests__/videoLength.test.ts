import { describe, expect, it } from "vitest";
import {
	VIDEO_LENGTH_TARGETS,
	VIDEO_LENGTH_SPECS,
	videoLengthBudget,
} from "../videoLength";

describe("VIDEO_LENGTH_SPECS", () => {
	it("translates each runtime into a spoken word budget at 180 wpm", () => {
		expect(VIDEO_LENGTH_SPECS["under-30s"]).toMatchObject({
			minWords: 50,
			maxWords: 90,
			minSec: 15,
			maxSec: 30,
		});
		expect(VIDEO_LENGTH_SPECS["10-15m"]).toMatchObject({
			minWords: 1800,
			maxWords: 2700,
			minSec: 600,
			maxSec: 900,
		});
		expect(VIDEO_LENGTH_SPECS["15-20m"]).toMatchObject({
			label: "15-20 min",
			minWords: 2700,
			maxWords: 3600,
			minSec: 900,
			maxSec: 1200,
		});
		expect(VIDEO_LENGTH_SPECS["20-30m"]).toMatchObject({
			label: "20-30 min",
			minWords: 3600,
			maxWords: 5400,
			minSec: 1200,
			maxSec: 1800,
		});
	});

	it("gives every length an ascending budget", () => {
		for (const length of VIDEO_LENGTH_TARGETS) {
			const { minWords, maxWords, label } = VIDEO_LENGTH_SPECS[length];
			expect(label).not.toBe("");
			expect(minWords).toBeLessThan(maxWords);
		}
	});

	it("lists the lengths shortest first, each starting where the one before ends", () => {
		const specs = VIDEO_LENGTH_TARGETS.map(
			(length) => VIDEO_LENGTH_SPECS[length],
		);
		for (let i = 1; i < specs.length; i++) {
			expect(specs[i].minSec).toBe(specs[i - 1].maxSec);
		}
	});
});

describe("videoLengthBudget", () => {
	it("gives auto no budget, so no reader can invent one", () => {
		expect(videoLengthBudget("auto")).toBeUndefined();
	});

	it("gives every other length its spec", () => {
		expect(videoLengthBudget("1-3m")).toBe(VIDEO_LENGTH_SPECS["1-3m"]);
	});
});
