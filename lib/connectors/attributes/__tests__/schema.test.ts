import { describe, expect, it } from "vitest";
import { AttributeSchema } from "../schema";

describe("AttributeSchema", () => {
	it("derives visibleAttributes and defaultAttributes in def order", () => {
		const schema = AttributeSchema.from([
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

		expect(Object.keys(schema.visibleAttributes)).toEqual(["loops", "volume"]);
		expect(schema.defaultAttributes).toEqual({ loops: "1", volume: "2" });
	});

	it("omits defs with no default from defaultAttributes", () => {
		const schema = AttributeSchema.from([
			{ key: "videoPrompt", label: "Video prompt", edit: { kind: "text" } },
		]);

		expect(schema.defaultAttributes).toEqual({});
		expect(schema.visibleAttributes.videoPrompt).toEqual({
			label: "Video prompt",
			icon: undefined,
			edit: { kind: "text" },
		});
	});

	it("merge layers overrides on top of a base, overriding same keys and appending new ones", () => {
		const base = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
			{ key: "motion", label: "Motion", default: "none" },
		]);
		const overrides = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "8" },
			{ key: "seed", label: "Seed", default: "0" },
		]);

		const merged = AttributeSchema.merge(base, overrides);

		expect(merged.keys).toEqual(["volume", "motion", "seed"]);
		expect(merged.defaultAttributes).toEqual({
			volume: "8",
			motion: "none",
			seed: "0",
		});
	});

	it("extend is equivalent to merge with reversed argument order", () => {
		const base = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "5" },
		]);
		const overrides = AttributeSchema.from([
			{ key: "volume", label: "Volume", default: "8" },
		]);

		expect(overrides.extend(base).defaultAttributes).toEqual(
			AttributeSchema.merge(base, overrides).defaultAttributes,
		);
	});

	it("add appends a new def, or replaces an existing one with the same key", () => {
		const schema = AttributeSchema.from([
			{ key: "loops", label: "Loops", default: "1" },
		]).add({
			key: "loops",
			label: "Loops",
			default: "3",
		});

		expect(schema.keys).toEqual(["loops"]);
		expect(schema.defaultAttributes.loops).toBe("3");
	});

	it("override patches a single def without touching the others", () => {
		const schema = AttributeSchema.from([
			{ key: "duration", label: "Duration", default: "5" },
			{ key: "motion", label: "Motion", default: "none" },
		]).override("duration", { default: "10" });

		expect(schema.defaultAttributes).toEqual({
			duration: "10",
			motion: "none",
		});
	});

	it("remove drops a def by key", () => {
		const schema = AttributeSchema.from([
			{ key: "duration", label: "Duration", default: "5" },
			{ key: "motion", label: "Motion", default: "none" },
		]).remove("motion");

		expect(schema.keys).toEqual(["duration"]);
	});
});
