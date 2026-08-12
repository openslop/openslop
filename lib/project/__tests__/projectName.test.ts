import { describe, expect, it } from "vitest";
import { deriveProjectName } from "../projectName";
import type { Metadata } from "../types";

const base: Metadata = {
	title: "",
	style: "",
	language: "auto",
	narration: {},
	characters: {},
};

describe("deriveProjectName", () => {
	it("returns 'Untitled' for missing metadata", () => {
		expect(deriveProjectName(undefined)).toBe("Untitled");
	});

	it("returns 'Untitled' for empty or whitespace titles", () => {
		expect(deriveProjectName({ ...base, title: "" })).toBe("Untitled");
		expect(deriveProjectName({ ...base, title: "   " })).toBe("Untitled");
	});

	it("trims and returns valid titles", () => {
		expect(deriveProjectName({ ...base, title: "  My Slop  " })).toBe(
			"My Slop",
		);
	});
});
