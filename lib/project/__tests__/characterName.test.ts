import { describe, expect, it } from "vitest";
import { normalizeCharacterName } from "../characterName";

describe("normalizeCharacterName", () => {
	it("capitalizes single names", () => {
		expect(normalizeCharacterName("alice")).toBe("Alice");
	});

	it("lowercases shouted names", () => {
		expect(normalizeCharacterName("ALICE")).toBe("Alice");
	});

	it("normalizes each word in multi-word names", () => {
		expect(normalizeCharacterName("alice SMITH")).toBe("Alice Smith");
		expect(normalizeCharacterName("MARY jane WATSON")).toBe("Mary Jane Watson");
	});

	it("collapses surrounding and inner whitespace", () => {
		expect(normalizeCharacterName("  alice   smith  ")).toBe("Alice Smith");
	});

	it("returns empty string for blank input", () => {
		expect(normalizeCharacterName("")).toBe("");
		expect(normalizeCharacterName("   ")).toBe("");
	});
});
