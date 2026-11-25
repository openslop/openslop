import { describe, expect, it } from "vitest";
import { normalizeAssetName } from "../asset-name";

describe("normalizeAssetName", () => {
	it("capitalizes single names", () => {
		expect(normalizeAssetName("alice")).toBe("Alice");
	});

	it("lowercases shouted names", () => {
		expect(normalizeAssetName("ALICE")).toBe("Alice");
	});

	it("normalizes each word in multi-word names", () => {
		expect(normalizeAssetName("alice SMITH")).toBe("Alice Smith");
		expect(normalizeAssetName("MARY jane WATSON")).toBe("Mary Jane Watson");
	});

	it("collapses surrounding and inner whitespace", () => {
		expect(normalizeAssetName("  alice   smith  ")).toBe("Alice Smith");
	});

	it("returns empty string for blank input", () => {
		expect(normalizeAssetName("")).toBe("");
		expect(normalizeAssetName("   ")).toBe("");
	});
});
