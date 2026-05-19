import { describe, expect, it } from "vitest";
import { LAYOUT_ATTRIBUTE_KEYS } from "@/lib/video/elementAttributes";
import type { CanvasContentElement } from "../../types";
import { getGenerationInputs } from "../getGenerationInputs";

const element = (
	customAttributes: Record<string, string>,
): CanvasContentElement => ({
	id: "el-1",
	type: "clip",
	customAttributes,
	children: [{ id: "t-1", type: "clip", text: "a dragon flying" }],
});

describe("getGenerationInputs", () => {
	it("keeps generation-affecting attributes", () => {
		const { prompt, attributes } = getGenerationInputs(
			element({ model: "Slop Video v1", duration: "5", provider: "openslop" }),
		);
		expect(prompt).toBe("a dragon flying");
		expect(attributes).toEqual({
			model: "Slop Video v1",
			duration: "5",
			provider: "openslop",
		});
	});

	it("strips exactly the centralized LAYOUT_ATTRIBUTE_KEYS contract", () => {
		const layoutOnly = Object.fromEntries(
			LAYOUT_ATTRIBUTE_KEYS.map((k) => [k, "1"]),
		);
		const { attributes } = getGenerationInputs(
			element({ ...layoutOnly, model: "Slop Video v1" }),
		);
		for (const key of LAYOUT_ATTRIBUTE_KEYS) {
			expect(attributes).not.toHaveProperty(key);
		}
		expect(attributes).toEqual({ model: "Slop Video v1" });
	});
});
