import { describe, expect, it } from "vitest";
import { formatCost, truncateMiddle } from "../format";

describe("truncateMiddle", () => {
	it("leaves text that already fits", () => {
		expect(truncateMiddle("Oil painting", 20)).toBe("Oil painting");
	});

	it("leaves text of exactly the maximum length", () => {
		expect(truncateMiddle("abcde", 5)).toBe("abcde");
	});

	it("keeps both ends and never exceeds the maximum", () => {
		const result = truncateMiddle("Anime illustration, vivid palette", 20);
		expect(result.length).toBeLessThanOrEqual(20);
		expect(result).toContain("…");
		expect(result.startsWith("Anime")).toBe(true);
		expect(result.endsWith("palette")).toBe(true);
	});

	it("keeps whole words on both sides of the ellipsis", () => {
		expect(truncateMiddle("Graphite pencil sketch, loose sketchbook", 24)).toBe(
			"Graphite… sketchbook",
		);
	});

	it("never leaves a space stranded before the ellipsis", () => {
		expect(
			truncateMiddle("watercolour washes of soft pigment", 18),
		).not.toMatch(/\s…/);
	});

	it("still shortens text with no word breaks", () => {
		expect(truncateMiddle("a".repeat(40), 11)).toBe(
			`${"a".repeat(5)}…${"a".repeat(5)}`,
		);
	});
});

describe("formatCost", () => {
	it.each([
		[0.04, "$0.04"],
		[1.2, "$1.20"],
		[1.2345, "$1.23"],
		[0.0035, "$0.0035"],
		[0.000123, "$0.00012"],
		[0, "Free"],
	])("formats %s as %s", (usd, text) => {
		expect(formatCost(usd)).toBe(text);
	});
});
