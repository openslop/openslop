import { describe, expect, it } from "vitest";
import { openingOn } from "../startFrame";

describe("openingOn", () => {
	it("opens on the picture and keeps it selectable, so choosing another does not lose it", () => {
		expect(openingOn("https://img/frame.png")).toEqual({
			startFrame: "https://img/frame.png",
			uploadedFrame: "https://img/frame.png",
		});
	});
});
