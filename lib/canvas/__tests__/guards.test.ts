import { describe, expect, it } from "vitest";
import {
	isAssetElement,
	isAssetType,
	isContentElement,
	isElementType,
	isForeground,
	isCanvasElement,
} from "../guards";

describe("guards", () => {
	it.each([
		["asset_avatar", true, true, false, false],
		["asset_voice", true, true, false, false],
		["asset_style", true, true, false, false],
		["asset_references", true, true, false, false],
		["image", true, false, true, true],
		["music", true, false, true, false],
		["narration", true, false, true, false],
		["scene", false, false, false, false],
		["toString", false, false, false, false],
	])(
		"%s: element %s, asset %s, content %s, foreground %s",
		(type, element, asset, content, foreground) => {
			const node = { id: "n", type, children: [] };

			expect(isElementType(type)).toBe(element);
			expect(isCanvasElement(node)).toBe(element);
			expect(isAssetType(type)).toBe(asset);
			expect(isAssetElement(node)).toBe(asset);
			expect(isContentElement(node)).toBe(content);
			expect(isForeground(node)).toBe(foreground);
		},
	);

	it("rejects a text leaf", () => {
		const leaf = { text: "plain" };

		expect(isCanvasElement(leaf)).toBe(false);
		expect(isAssetElement(leaf)).toBe(false);
		expect(isContentElement(leaf)).toBe(false);
	});
});
