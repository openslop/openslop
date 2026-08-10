import { describe, expect, it } from "vitest";
import {
	parseReferenceImages,
	serializeReferenceImages,
} from "../referenceImages";

describe("parseReferenceImages", () => {
	it("distinguishes an absent attribute from an empty one", () => {
		expect(parseReferenceImages(undefined)).toBeUndefined();
		expect(parseReferenceImages("")).toEqual([]);
	});

	it("trims entries and drops blanks", () => {
		expect(parseReferenceImages(" a.png , ,b.png ")).toEqual([
			"a.png",
			"b.png",
		]);
	});

	it("round-trips a serialized list", () => {
		const urls = ["https://img/a.png", "https://img/b.png"];
		expect(parseReferenceImages(serializeReferenceImages(urls))).toEqual(urls);
	});
});
