import { describe, expect, it } from "vitest";
import { ContentTypeSchema, ElementTypeSchema } from "@/lib/canvas/types";
import { editScript } from "../tools/edit-script";

const parses = (op: Record<string, unknown>) =>
	editScript.input.safeParse({ ops: [op] }).success;

describe("edit_script", () => {
	it("accepts an asset_voice insert with no text, as its description says", () => {
		expect(editScript.spec.description).toContain(
			"asset_voice: how a speaker sounds, as its attributes and no text",
		);
		expect(
			parses({ op: "insert", type: "asset_voice", attrs: { name: "Mia" } }),
		).toBe(true);
	});

	it("parses every element type it lists as an insert, and every script type as a retype", () => {
		expect(editScript.spec.description).toContain(
			`Script types: ${ContentTypeSchema.options.join(", ")}`,
		);
		for (const type of ElementTypeSchema.options) {
			expect(parses({ op: "insert", type, attrs: { name: "Mia" } })).toBe(true);
		}
		for (const type of ContentTypeSchema.options) {
			expect(parses({ op: "set", id: "n1", type })).toBe(true);
		}
		expect(parses({ op: "set", id: "n1", type: "asset_avatar" })).toBe(false);
	});

	it("offers attributes whose control lives inside another's, like a video's continuity", () => {
		expect(editScript.spec.description).toContain("continuity (false | true)");
	});

	it("teaches a character line's name and a video's start frame", () => {
		const { description } = editScript.spec;
		expect(description).toContain("- character: name, emotion");
		expect(description).toContain(
			"startFrame is none, previous or a picture URL",
		);
	});

	it("leaves a model's own options off the attributes every model has", () => {
		expect(editScript.spec.description).toContain("These hold for every model");
		expect(editScript.spec.description).not.toContain("resolution (");
	});

	it("writes music by the same cue-sheet guide the script writer follows", () => {
		expect(editScript.spec.description).toContain("## Music prompts");
		expect(editScript.spec.description).not.toMatch(/- music: length/);
	});
});
