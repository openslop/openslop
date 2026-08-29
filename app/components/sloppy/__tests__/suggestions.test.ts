import { describe, expect, it } from "vitest";
import { nextSuggestion, SUGGESTIONS } from "../suggestions";

describe("nextSuggestion", () => {
	it("returns a known suggestion", () => {
		expect(SUGGESTIONS).toContain(nextSuggestion(""));
	});

	it("never repeats the current suggestion", () => {
		for (const current of SUGGESTIONS) {
			for (let attempt = 0; attempt < 50; attempt++) {
				expect(nextSuggestion(current)).not.toBe(current);
			}
		}
	});
});
