import { describe, expect, it } from "vitest";
import { AttributeSchema } from "../../attributes/schema";
import { frameSource, openingOn, startFrameDef } from "../start-frame";

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

describe("startFrameDef", () => {
	const schema = AttributeSchema.from([startFrameDef]);

	it.each(["none", "previous", "https://img/frame.png"])(
		"offers %s",
		(frame) => {
			expect(schema.offers("startFrame", frame)).toBe(true);
		},
	);

	it("offers no value that would fall through to nothing", () => {
		expect(schema.offers("startFrame", "not a url")).toBe(false);
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
