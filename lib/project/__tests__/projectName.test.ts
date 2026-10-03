import { describe, expect, it } from "vitest";
import { deriveProjectName } from "../projectName";

describe("deriveProjectName", () => {
	it("returns 'Untitled' for empty or whitespace titles", () => {
		expect(deriveProjectName("")).toBe("Untitled");
		expect(deriveProjectName("   ")).toBe("Untitled");
	});

	it("trims and returns valid titles", () => {
		expect(deriveProjectName("  My Slop  ")).toBe("My Slop");
	});
});
