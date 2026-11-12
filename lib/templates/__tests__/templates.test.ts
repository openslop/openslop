import { afterEach, describe, expect, it, vi } from "vitest";
import povLife from "../data/pov-life/template.json";
import {
	getTemplate,
	getTemplateById,
	TemplateSchema,
	TEMPLATES,
} from "../templates";

describe("template data", () => {
	it("loads the catalog without prompt prose", () => {
		expect(TEMPLATES).toHaveLength(7);
		for (const template of TEMPLATES) {
			expect(getTemplate(template.id)).toBe(template);
			expect(template).not.toHaveProperty("systemPrompt");
			expect(template).not.toHaveProperty("exampleText");
		}
	});

	it.each([
		["missing name", { name: undefined }],
		["unknown length", { length: "forever" }],
		["invalid color", { color: "orange" }],
		["invalid narration", { narration: { gender: "typo" } }],
		[
			"invalid character voice",
			{ characters: { Protagonist: { appearance: "a man", pitch: "typo" } } },
		],
		["unknown field", { systemPrompt: "prose belongs in Markdown" }],
	])("rejects malformed data: %s", (_, fields) => {
		expect(() => TemplateSchema.parse({ ...povLife, ...fields })).toThrow();
	});

	it("distinguishes stored ids from catalog ids", () => {
		expect(getTemplateById(undefined)).toBeUndefined();
		expect(getTemplateById("removed")).toBeUndefined();
		expect(() => getTemplate("removed")).toThrow(
			'Unknown template id "removed"',
		);
	});
});

describe("template prompts", () => {
	afterEach(() => {
		vi.doUnmock("../data/pov-life/system-prompt.md?raw");
		vi.resetModules();
	});

	it("fails at load when a prompt file is empty", async () => {
		vi.doMock("../data/pov-life/system-prompt.md?raw", () => ({
			default: " \n ",
		}));
		vi.resetModules();
		await expect(import("../prompts")).rejects.toThrow();
	});
});
