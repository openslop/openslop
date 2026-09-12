import { describe, expect, it } from "vitest";
import { parseStartFrame } from "../startFrame";

describe("parseStartFrame", () => {
	it("reads nothing from an absent or blank value", () => {
		expect(parseStartFrame(undefined)).toBeUndefined();
		expect(parseStartFrame("")).toBeUndefined();
		expect(parseStartFrame("  ")).toBeUndefined();
	});

	it("reads a URL as a picture of its own", () => {
		expect(parseStartFrame("https://img/frame.png")).toEqual({
			kind: "url",
			url: "https://img/frame.png",
		});
	});

	it("reads anything else as another visual's id", () => {
		expect(parseStartFrame(" abc123 ")).toEqual({
			kind: "element",
			id: "abc123",
		});
	});
});
