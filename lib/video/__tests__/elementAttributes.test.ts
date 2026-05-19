import { describe, expect, it } from "vitest";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	LAYOUT_ATTRIBUTE_KEYS,
	getLoops,
	getMotion,
	getVolume,
	layoutAttributeSignature,
} from "../elementAttributes";

function el(customAttributes?: Record<string, string>): CanvasContentElement {
	return {
		id: "e1",
		type: "music",
		...(customAttributes && { customAttributes }),
		children: [{ id: "e1-t", type: "music", text: "" }],
	};
}

describe("getVolume", () => {
	it("defaults to 10 when missing or non-numeric", () => {
		expect(getVolume(el())).toBe(10);
		expect(getVolume(el({ volume: "not-a-number" }))).toBe(10);
	});

	it("passes through valid values including 0", () => {
		expect(getVolume(el({ volume: "0" }))).toBe(0);
		expect(getVolume(el({ volume: "3" }))).toBe(3);
	});

	it("clamps out-of-range values to [0, 10]", () => {
		expect(getVolume(el({ volume: "-2" }))).toBe(0);
		expect(getVolume(el({ volume: "42" }))).toBe(10);
	});
});

describe("getLoops", () => {
	it("defaults to 1 when missing, invalid, or below 1", () => {
		expect(getLoops(el())).toBe(1);
		expect(getLoops(el({ loops: "not-a-number" }))).toBe(1);
		expect(getLoops(el({ loops: "0" }))).toBe(1);
	});

	it("reads valid loop counts", () => {
		expect(getLoops(el({ loops: "4" }))).toBe(4);
	});
});

describe("getMotion", () => {
	it("defaults to 'none' when missing or invalid", () => {
		expect(getMotion(el())).toBe("none");
		expect(getMotion(el({ motion: "not-an-effect" }))).toBe("none");
		expect(getMotion(el({ motion: "" }))).toBe("none");
	});

	it("passes through known effects", () => {
		expect(getMotion(el({ motion: "kenBurnsIn" }))).toBe("kenBurnsIn");
		expect(getMotion(el({ motion: "shake" }))).toBe("shake");
	});

	it("is included in LAYOUT_ATTRIBUTE_KEYS so changes invalidate layout memos", () => {
		expect(LAYOUT_ATTRIBUTE_KEYS).toContain("motion");
	});
});

describe("layoutAttributeSignature", () => {
	it("joins raw layout attribute values in LAYOUT_ATTRIBUTE_KEYS order", () => {
		expect(LAYOUT_ATTRIBUTE_KEYS).toEqual([
			"loops",
			"volume",
			"motion",
			"captions",
		]);
		expect(
			layoutAttributeSignature(
				el({
					loops: "2",
					volume: "5",
					motion: "kenBurnsIn",
					captions: "off",
				}),
			),
		).toBe("2:5:kenBurnsIn:off");
	});

	it("uses empty segments for absent attributes (raw, uncoerced)", () => {
		expect(layoutAttributeSignature(el())).toBe(":::");
		expect(layoutAttributeSignature(el({ loops: "0" }))).toBe("0:::");
		expect(layoutAttributeSignature(el({ volume: "10" }))).toBe(":10::");
		expect(layoutAttributeSignature(el({ motion: "shake" }))).toBe("::shake:");
		expect(layoutAttributeSignature(el({ captions: "off" }))).toBe(":::off");
	});
});
