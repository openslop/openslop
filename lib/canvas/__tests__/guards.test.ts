import { describe, expect, it } from "vitest";
import {
	isAssetElement,
	isAssetType,
	isCanvasElementType,
	isContentElement,
	isForeground,
	isParsedContentElement,
	isScriptElement,
} from "../guards";
import type { ParsedElement } from "../types";

const parsed = (type: string): ParsedElement => ({
	id: "n1",
	type,
	children: [{ id: "t1", type, text: "" }],
});

describe("isCanvasElementType", () => {
	it("accepts declared element types", () => {
		expect(isCanvasElementType("image")).toBe(true);
		expect(isCanvasElementType("video")).toBe(true);
	});

	it("rejects scene, asset and unknown tags", () => {
		expect(isCanvasElementType("scene")).toBe(false);
		expect(isCanvasElementType("cast")).toBe(false);
		expect(isCanvasElementType("nonsense")).toBe(false);
	});
});

describe("isParsedContentElement", () => {
	it("narrows canvas nodes and rejects assets and unknown tags", () => {
		expect(isParsedContentElement(parsed("music"))).toBe(true);
		expect(isParsedContentElement(parsed("cast"))).toBe(false);
		expect(isParsedContentElement(parsed("nonsense"))).toBe(false);
	});
});

describe("isAssetType", () => {
	it("accepts the asset types and nothing else", () => {
		expect(["title", "cast", "style", "references"].every(isAssetType)).toBe(
			true,
		);
		expect(["image", "scene", "toString"].some(isAssetType)).toBe(false);
	});
});

describe("isAssetElement and isScriptElement", () => {
	it.each([
		[{ id: "a", type: "cast", children: [] }, true, true],
		[{ id: "a", type: "image", children: [] }, false, true],
		[{ id: "a", type: "scene", children: [] }, false, false],
		[{ text: "plain" }, false, false],
	])("%o: asset %s, script %s", (node, asset, script) => {
		expect(isAssetElement(node)).toBe(asset);
		expect(isScriptElement(node)).toBe(script);
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
