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
});
