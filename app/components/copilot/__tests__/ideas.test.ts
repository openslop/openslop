import { describe, expect, it } from "vitest";
import { IDEAS, nextIdea } from "../ideas";

describe("nextIdea", () => {
	it("returns a known idea", () => {
		expect(IDEAS).toContain(nextIdea(""));
	});

	it("never repeats the current idea", () => {
		for (const current of IDEAS) {
			for (let attempt = 0; attempt < 50; attempt++) {
				expect(nextIdea(current)).not.toBe(current);
			}
		}
	});
});
