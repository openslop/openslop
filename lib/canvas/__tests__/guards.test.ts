import { describe, expect, it } from "vitest";
import {
	isCanvasElementType,
	isContentElement,
	isForeground,
	isParsedContentElement,
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
		expect(isCanvasElementType("animated_image")).toBe(true);
	});

	it("rejects scene, metadata and unknown tags", () => {
		expect(isCanvasElementType("scene")).toBe(false);
		expect(isCanvasElementType("metadata_title")).toBe(false);
		expect(isCanvasElementType("nonsense")).toBe(false);
	});
});

describe("isParsedContentElement", () => {
	it("narrows canvas nodes and rejects metadata nodes", () => {
		expect(isParsedContentElement(parsed("music"))).toBe(true);
		expect(isParsedContentElement(parsed("metadata_character"))).toBe(false);
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
