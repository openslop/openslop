import { describe, expect, it } from "vitest";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import {
	formatCharacterNames,
	getElementCharacterNames,
	parseCharacterNames,
} from "../characterNames";
import { splitAttributes } from "@/lib/canvas/elementAttributes";

describe("parseCharacterNames", () => {
	it("splits, trims, and drops empty names", () => {
		expect(parseCharacterNames("Alice, Bob ,, Red")).toEqual([
			"Alice",
			"Bob",
			"Red",
		]);
	});

	it("returns an empty array for undefined or empty input", () => {
		expect(parseCharacterNames(undefined)).toEqual([]);
		expect(parseCharacterNames("")).toEqual([]);
		expect(parseCharacterNames("  ,  ")).toEqual([]);
	});
});

describe("formatCharacterNames", () => {
	it("round-trips through parseCharacterNames", () => {
		const names = ["Alice", "Bob"];
		expect(parseCharacterNames(formatCharacterNames(names) ?? "")).toEqual(
			names,
		);
	});

	it("clears the attribute for an empty list", () => {
		expect(formatCharacterNames([])).toBeNull();
	});
});

function makeElement(
	type: CanvasElementType,
	customAttributes?: Record<string, string>,
): CanvasContentElement {
	return {
		id: "e1",
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: "t1", type, text: "" }],
	};
}

describe("getElementCharacterNames", () => {
	it("returns empty when no customAttributes", () => {
		expect(getElementCharacterNames(makeElement("character"))).toEqual([]);
	});

	it("returns empty when no name or characters attribute", () => {
		expect(
			getElementCharacterNames(makeElement("narration", { emotion: "happy" })),
		).toEqual([]);
	});

	it("extracts name attribute as a single entry", () => {
		expect(
			getElementCharacterNames(makeElement("character", { name: "Alice" })),
		).toEqual(["Alice"]);
	});

	it("trims whitespace from name attribute", () => {
		expect(
			getElementCharacterNames(makeElement("character", { name: " Alice " })),
		).toEqual(["Alice"]);
	});

	it("parses characters CSV into trimmed names", () => {
		expect(
			getElementCharacterNames(
				makeElement("image", { characters: "Red, Granny" }),
			),
		).toEqual(["Red", "Granny"]);
	});

	it("filters empty entries from characters CSV", () => {
		expect(
			getElementCharacterNames(
				makeElement("image", { characters: "Red,,  ,Granny" }),
			),
		).toEqual(["Red", "Granny"]);
	});

	it("concatenates name and characters when both present", () => {
		expect(
			getElementCharacterNames(
				makeElement("image", { name: "Alice", characters: "Red,Granny" }),
			),
		).toEqual(["Alice", "Red", "Granny"]);
	});

	it("deduplicates repeated names while preserving first occurrence order", () => {
		expect(
			getElementCharacterNames(
				makeElement("image", {
					name: "Alice",
					characters: "Alice, Red, Alice, Granny, Red",
				}),
			),
		).toEqual(["Alice", "Red", "Granny"]);
	});

	it("ignores element type — extracts from any element with the attributes", () => {
		expect(
			getElementCharacterNames(makeElement("narration", { characters: "Bob" })),
		).toEqual(["Bob"]);
	});
});
