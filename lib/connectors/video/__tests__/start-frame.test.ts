import { describe, expect, it } from "vitest";
import { frameSource, openingOn } from "../start-frame";

describe("frameSource", () => {
	it.each([undefined, "none", "not a url"])(
		"opens on nothing for %s",
		(frame) => {
			expect(frameSource(frame)).toEqual({ kind: "none" });
		},
	);

	it("opens on the visual before the video", () => {
		expect(frameSource("previous")).toEqual({ kind: "previous" });
	});

	it("opens on an uploaded picture by its URL", () => {
		expect(frameSource("https://img/frame.png")).toEqual({
			kind: "upload",
			url: "https://img/frame.png",
		});
	});
});

describe("openingOn", () => {
	it("opens on the picture and keeps it selectable, so choosing another does not lose it", () => {
		expect(openingOn("https://img/frame.png")).toEqual({
			startFrame: "https://img/frame.png",
			uploadedFrame: "https://img/frame.png",
		});
	});
});
