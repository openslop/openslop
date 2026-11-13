import { describe, expect, it } from "vitest";
import { povLife } from "../data/pov-life";
import {
	getTemplate,
	getTemplateById,
	TemplateSchema,
	TEMPLATES,
} from "../templates";

describe("templates", () => {
	it("resolves asset names to Blob URLs", () => {
		const [image] = getTemplate("pov-life").referenceImages;

		expect(image).toMatch(/^https?:\/\/.+\/assets\/upload\/template\//);
	});

	it.each([
		["missing name", { name: undefined }],
		["empty system prompt", { systemPrompt: "" }],
		["unknown length", { length: "forever" }],
		["invalid color", { color: "orange" }],
		["invalid narration", { narration: { gender: "typo" } }],
		[
			"invalid character voice",
			{ characters: { Protagonist: { appearance: "a man", pitch: "typo" } } },
		],
		["unknown field", { prompt: "stray" }],
	])("rejects malformed data: %s", (_, fields) => {
		expect(() => TemplateSchema.parse({ ...povLife, ...fields })).toThrow();
	});

	it("distinguishes stored ids from catalog ids", () => {
		expect(TEMPLATES.map(({ id }) => getTemplateById(id))).toEqual(TEMPLATES);
		expect(getTemplateById(undefined)).toBeUndefined();
		expect(getTemplateById("removed")).toBeUndefined();
		expect(() => getTemplate("removed")).toThrow(
			'Unknown template id "removed"',
		);
	});
});
