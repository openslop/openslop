import { describe, expect, it } from "vitest";
import { preservedAttributes } from "../preservedAttributes";
import type { CanvasContentElement } from "../types";

function element(
	type: CanvasContentElement["type"],
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return { id: "n1", type, customAttributes, children: [] };
}

describe("preservedAttributes", () => {
	it("carries shared attributes between types in the same group", () => {
		const source = element("image", { characters: "Red,Granny" });
		expect(preservedAttributes(source, "animated_image")).toEqual({
			characters: "Red,Granny",
		});
	});

	it("drops attributes when the target type is outside the group", () => {
		const source = element("image", { characters: "Red,Granny" });
		expect(preservedAttributes(source, "narration")).toEqual({});
	});

	it("never carries attributes that are not declared shared", () => {
		const source = element("image", {
			characters: "Red",
			url: "https://example.com/old.png",
		});
		expect(preservedAttributes(source, "animated_image")).toEqual({
			characters: "Red",
		});
	});

	it("returns an empty object when there are no custom attributes", () => {
		expect(preservedAttributes(element("image"), "animated_image")).toEqual({});
	});
});
