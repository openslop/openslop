import { describe, expect, it } from "vitest";
import { AssetTypeSchema, ContentTypeSchema } from "@/lib/canvas/types";
import { editScript } from "../tools/edit-script";

const parses = (op: Record<string, unknown>) =>
	editScript.input.safeParse({ ops: [op] }).success;

describe("edit_script", () => {
	it("accepts an asset_voice with no text", () => {
		expect(
			parses({ op: "asset", type: "asset_voice", attrs: { name: "Mia" } }),
		).toBe(true);
	});

	it("inserts every script type, and sets up every asset type as an asset op", () => {
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
});
