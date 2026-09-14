import { describe, expect, it } from "vitest";
import { parseStartFrame, splitPrevious } from "../startFrame";

describe("splitPrevious", () => {
	const frames = ["first", "middle", "last"];

	it("opens on the last picture and leaves the rest, or leaves them all", () => {
		expect(splitPrevious(frames, true)).toEqual({
			startFrame: ["last"],
			rest: ["first", "middle"],
		});
		expect(splitPrevious(frames, false)).toEqual({
			startFrame: [],
			rest: frames,
		});
	});
});

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

	it("reads none as no frame, and previous as the visual before", () => {
		expect(parseStartFrame("none")).toBeUndefined();
		expect(parseStartFrame(" previous ")).toEqual({ kind: "previous" });
	});
});
