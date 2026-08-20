import { describe, expect, it } from "vitest";
import { getTemplate } from "../templates";
import { templateBrief } from "../templateBrief";

describe("templateBrief", () => {
	it("reads as the sentence the composer shows", () => {
		expect(
			templateBrief(getTemplate("celebrity-death"), "greatest footballer"),
		).toBe("Death of every greatest footballer");
	});

	it("leaves the input alone without a template", () => {
		expect(templateBrief(undefined, "  a sleepy moon rabbit  ")).toBe(
			"  a sleepy moon rabbit  ",
		);
	});
});
