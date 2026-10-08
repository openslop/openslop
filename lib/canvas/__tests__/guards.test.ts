import { describe, expect, it } from "vitest";
import {
	isAssetElement,
	isAssetType,
	isContentType,
	isContentElement,
	isElementType,
	isForeground,
	isParsedContentElement,
	isCanvasElement,
} from "../guards";
import type { ParsedElement } from "../types";

const parsed = (type: string): ParsedElement => ({
	id: "n1",
	type,
	children: [{ id: "t1", type, text: "" }],
});

describe("isContentType", () => {
	it("accepts declared element types", () => {
		expect(isContentType("image")).toBe(true);
		expect(isContentType("video")).toBe(true);
	});

	it("rejects scene, asset and unknown tags", () => {
		expect(isContentType("scene")).toBe(false);
		expect(isContentType("asset_avatar")).toBe(false);
		expect(isContentType("nonsense")).toBe(false);
	});
});

describe("isElementType", () => {
	it("accepts content and asset types, and nothing else", () => {
		expect(["narration", "music", "asset_voice"].every(isElementType)).toBe(
			true,
		);
		expect(["scene", "nonsense", "toString"].some(isElementType)).toBe(false);
	});
});

describe("isParsedContentElement", () => {
	it("narrows canvas nodes and rejects assets and unknown tags", () => {
		expect(isParsedContentElement(parsed("music"))).toBe(true);
		expect(isParsedContentElement(parsed("asset_avatar"))).toBe(false);
		expect(isParsedContentElement(parsed("nonsense"))).toBe(false);
	});
});

describe("isAssetType", () => {
	it("accepts the asset types and nothing else", () => {
		expect(
			["asset_avatar", "asset_voice", "asset_style", "asset_references"].every(
				isAssetType,
			),
		).toBe(true);
		expect(["image", "scene", "toString"].some(isAssetType)).toBe(false);
	});
});

describe("isAssetElement and isCanvasElement", () => {
	it.each([
		[{ id: "a", type: "asset_avatar", children: [] }, true, true],
		[{ id: "v", type: "asset_voice", children: [] }, true, true],
		[{ id: "a", type: "image", children: [] }, false, true],
		[{ id: "a", type: "scene", children: [] }, false, false],
		[{ text: "plain" }, false, false],
	])("%o: asset %s, script %s", (node, asset, script) => {
		expect(isAssetElement(node)).toBe(asset);
		expect(isCanvasElement(node)).toBe(script);
	});
});

describe("isContentElement", () => {
	it("requires a slate element of a canvas type", () => {
		expect(isContentElement({ id: "a", type: "image", children: [] })).toBe(
			true,
		);
		expect(isContentElement({ id: "a", type: "scene", children: [] })).toBe(
			false,
		);
		expect(isContentElement({ text: "plain" })).toBe(false);
	});
});

describe("isForeground", () => {
	it("only accepts foreground-role element types", () => {
		expect(isForeground({ id: "a", type: "image", children: [] })).toBe(true);
		expect(isForeground({ id: "a", type: "music", children: [] })).toBe(false);
	});
});
