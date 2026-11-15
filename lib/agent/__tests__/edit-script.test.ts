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

	it("writes music by the same cue-sheet guide the script writer follows", () => {
		expect(editScript.spec.description).toContain("## Music prompts");
		expect(editScript.spec.description).not.toMatch(/- music: length/);
	});
});
