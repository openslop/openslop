import { describe, expect, it } from "vitest";
import { TEMPLATES } from "../templates";
import { getTemplatePrompt } from "../templatePrompts";

describe("getTemplatePrompt", () => {
	it("has an example story for every template in the catalog", () => {
		for (const template of TEMPLATES) {
			expect(getTemplatePrompt(template.id).exampleStory).not.toBe("");
		}
	});

	it("throws on an id the catalog does not carry", () => {
		expect(() => getTemplatePrompt("not-a-template")).toThrow(
			'Unknown template id "not-a-template"',
		);
	});
});
