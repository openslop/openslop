import { describe, expect, it } from "vitest";
import { AssetTypeSchema, ContentTypeSchema } from "@/lib/canvas/types";
import { editScript } from "../tools/edit-script";

const parses = (op: Record<string, unknown>) =>
	editScript.input.safeParse({ ops: [op] }).success;

describe("edit_script", () => {
	it("accepts an asset_voice with no text, as its description says", () => {
		expect(editScript.spec.description).toContain(
			"asset_voice: how a speaker sounds, as its attributes and no text",
		);
		expect(
			parses({ op: "asset", type: "asset_voice", attrs: { name: "Mia" } }),
		).toBe(true);
	});

	it("inserts every script type it lists, and sets up every asset type as an asset op", () => {
		expect(editScript.spec.description).toContain(
			`Script types: ${ContentTypeSchema.options.join(", ")}`,
		);
		for (const type of ContentTypeSchema.options) {
			expect(parses({ op: "insert", elements: [{ type, text: "x" }] })).toBe(
				true,
			);
		}
		for (const type of AssetTypeSchema.options) {
			expect(parses({ op: "asset", type, attrs: { name: "Mia" } })).toBe(true);
			expect(parses({ op: "insert", elements: [{ type }] })).toBe(false);
		}
		expect(parses({ op: "insert", elements: [] })).toBe(false);
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
		expect(editScript.spec.description).toContain(
			"The attributes above work with every model",
		);
		expect(editScript.spec.description).not.toContain("resolution (");
	});

	it("writes music by the same cue-sheet guide the script writer follows", () => {
		expect(editScript.spec.description).toContain("## Music prompts");
		expect(editScript.spec.description).not.toMatch(/- music: length/);
	});
});
