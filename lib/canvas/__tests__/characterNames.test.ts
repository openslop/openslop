import { describe, expect, it } from "vitest";
import type { ContentElement, ContentType } from "@/lib/canvas/types";
import {
	formatCharacterNames,
	parseCharacterNames,
	shownCharacters,
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

	it("names a repeated character once", () => {
		expect(parseCharacterNames("Sol, Mira, Sol")).toEqual(["Sol", "Mira"]);
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
	type: ContentType,
	customAttributes?: Record<string, string>,
): ContentElement {
	return {
		id: "e1",
		type,
		...splitAttributes(customAttributes ?? {}),
		children: [{ id: "t1", type, text: "" }],
	};
}

describe("shownCharacters", () => {
	it("returns empty when the element lists no characters", () => {
		expect(shownCharacters(makeElement("image"))).toEqual([]);
		expect(shownCharacters(makeElement("image", { style: "ink" }))).toEqual([]);
	});

	it("parses the characters CSV into trimmed, distinct names", () => {
		expect(
			shownCharacters(
				makeElement("image", { characters: "Red,,  ,Granny, Red" }),
			),
		).toEqual(["Red", "Granny"]);
	});

	it("leaves out the name a speech element is spoken by", () => {
		expect(
			shownCharacters(
				makeElement("image", { name: "Alice", characters: "Red" }),
			),
		).toEqual(["Red"]);
	});
});
