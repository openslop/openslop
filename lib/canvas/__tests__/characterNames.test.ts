import { describe, expect, it } from "vitest";
import { parseCharacterNames } from "../characterNames";

describe("parseCharacterNames", () => {
	it("splits, trims, and drops empty names", () => {
		expect(parseCharacterNames("Alice, Bob ,, Red")).toEqual([
			"Alice",
			"Bob",
			"Red",
		]);
	});

	it("returns an empty array for undefined or empty input", () => {
		expect(parseCharacterNames(undefined)).toEqual([]);
		expect(parseCharacterNames("")).toEqual([]);
		expect(parseCharacterNames("  ,  ")).toEqual([]);
	});
});
