import { describe, expect, it } from "vitest";
import { AttributeSchema } from "../schema";

describe("AttributeSchema", () => {
	it("splits badge and settings attributes, in def order", () => {
		const schema = AttributeSchema.from([
			{
				key: "model",
				label: "Model",
				edit: { kind: "enum", options: ["a", "b"] },
				default: "a",
				badge: true,
			},
			{
				key: "loops",
				label: "Loops",
				edit: { kind: "enum", options: ["1", "2"] },
				default: "1",
			},
			{
				key: "volume",
				label: "Volume",
				edit: { kind: "enum", options: ["0", "1"] },
				default: "2",
			},
		]);

		expect(Object.keys(schema.badgeAttributes)).toEqual(["model"]);
		expect(Object.keys(schema.settingsAttributes)).toEqual(["loops", "volume"]);
		expect(schema.defaultAttributes).toEqual({
			model: "a",
			loops: "1",
			volume: "2",
		});
	});

	it("omits defs with no default from defaultAttributes", () => {
		const schema = AttributeSchema.from([
			{ key: "videoPrompt", label: "Video prompt", edit: { kind: "text" } },
		]);

		expect(schema.defaultAttributes).toEqual({});
		expect(schema.settingsAttributes.videoPrompt).toEqual({
			label: "Video prompt",
			icon: undefined,
			edit: { kind: "text" },
		});
	});

	describe("resolve", () => {
		const schema = AttributeSchema.from([
			{
				key: "model",
				label: "Model",
				edit: { kind: "enum", options: ["a", "b"] },
				default: "a",
			},
			{
				key: "motion",
				label: "Motion",
				edit: { kind: "enum", options: ["x"] },
			},
			{ key: "prompt", label: "Prompt", edit: { kind: "text" } },
		]);

		it("fills defaults for attributes the caller left unset", () => {
			expect(schema.resolve({})).toEqual({ model: "a" });
		});

		it("falls back to the default when a value is not an offered option", () => {
			expect(schema.resolve({ model: "nope" })).toEqual({ model: "a" });
		});

		it("drops an unoffered value when the def has no default", () => {
			expect(schema.resolve({ motion: "nope" })).toEqual({ model: "a" });
		});

		it("keeps offered values, free text and unknown keys", () => {
			expect(
				schema.resolve({ model: "b", prompt: "anything", extra: "kept" }),
			).toEqual({ model: "b", prompt: "anything", extra: "kept" });
		});
	});
});
