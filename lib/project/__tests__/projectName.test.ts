import { describe, expect, it } from "vitest";
import { deriveProjectName } from "../projectName";
import { MetadataSchema, type Metadata } from "../types";

const base: Metadata = MetadataSchema.parse({});

describe("deriveProjectName", () => {
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
