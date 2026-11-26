import { describe, expect, it } from "vitest";
import {
	durationOptions,
	STANDARD_MAX_DURATION_SEC,
	VOLUME_OPTIONS,
} from "@/lib/canvas/types";
import {
	getDuration,
	getLoops,
	getMotion,
	getTrimEnd,
	getTrimStart,
	getVolume,
	getVolumeGain,
	flatAttributes,
	layoutAttributeSignature,
	splitAttributes,
	volumeToGain,
} from "../element-attributes";
import { gainToDb } from "@/lib/render/gain-taper";
import { element } from "./_assets";

const el = (attributes: Record<string, string> = {}) =>
	element("e1", "music", "", attributes);

describe("splitAttributes", () => {
	it("sorts layout keys out of what the generator sees", () => {
		expect(
			splitAttributes({
				style: "ink",
				volume: "5",
				motion: "pan",
				loops: "2",
			}),
		).toEqual({
			generationAttributes: { style: "ink" },
			layoutAttributes: {
				volume: "5",
				motion: "pan",
				loops: "2",
			},
		});
	});

	it("round-trips through flatAttributes", () => {
		const attributes = { style: "ink", volume: "5" };
		expect(flatAttributes(splitAttributes(attributes))).toEqual(attributes);
	});
});

describe("getVolume", () => {
	it("defaults to 10 when missing or non-numeric", () => {
		expect(getVolume(el())).toBe(10);
		expect(getVolume(el({ volume: "not-a-number" }))).toBe(10);
	});

	it("passes through valid values including 0", () => {
		expect(getVolume(el({ volume: "0" }))).toBe(0);
		expect(getVolume(el({ volume: "3" }))).toBe(3);
	});

	it("reads a blank attribute as unset rather than as a deliberate mute", () => {
		expect(getVolume(el({ volume: "" }))).toBe(10);
		expect(getVolume(el({ volume: "  " }))).toBe(10);
	});

	it("clamps out-of-range values to [0, 10]", () => {
		expect(getVolume(el({ volume: "-2" }))).toBe(0);
		expect(getVolume(el({ volume: "42" }))).toBe(10);
	});
});

describe("volumeToGain", () => {
	const toDb = (volume: number) => gainToDb(volumeToGain(volume));

	it("is silent at 0 and unity gain at 10", () => {
		expect(volumeToGain(0)).toBe(0);
		expect(volumeToGain(10)).toBe(1);
	});

	it("follows a 3 dB per step taper", () => {
		expect(toDb(1)).toBeCloseTo(-27);
		expect(toDb(5)).toBeCloseTo(-15);
	});
});

describe("getVolumeGain", () => {
	it("is the clamped volume on the decibel taper", () => {
		expect(getVolumeGain(el({ volume: "5" }))).toBe(volumeToGain(5));
		expect(getVolumeGain(el({ volume: "0" }))).toBe(0);
		expect(getVolumeGain(el({ volume: "42" }))).toBe(1);
	});

	it("is full gain when the element has no volume set", () => {
		expect(getVolumeGain(el())).toBe(1);
	});
});

describe("getDuration", () => {
	it("defaults to 10 when missing or non-numeric", () => {
		expect(getDuration(el())).toBe(10);
		expect(getDuration(el({ duration: "not-a-number" }))).toBe(10);
	});

	it("reads a blank attribute as unset rather than as the shortest option", () => {
		expect(getDuration(el({ duration: "" }))).toBe(10);
		expect(getDuration(el({ duration: "  " }))).toBe(10);
	});

	it("clamps out-of-range values to the offered options", () => {
		expect(getDuration(el({ duration: "1" }))).toBe(4);
		expect(getDuration(el({ duration: "99" }))).toBe(15);
	});

	it("clamps to the longest its own model generates", () => {
		const seedance = { provider: "runware", model: "Seedance 2.5" };
		expect(getDuration(el({ ...seedance, duration: "30" }))).toBe(30);
		expect(getDuration(el({ ...seedance, duration: "99" }))).toBe(30);
	});

	it("passes through offered values", () => {
		expect(getDuration(el({ duration: "7" }))).toBe(7);
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

	it("reads a blank attribute as unset", () => {
		expect(getLoops(el({ loops: "" }))).toBe(1);
		expect(getLoops(el({ loops: "  " }))).toBe(1);
	});

	it("passes fractional loop counts through", () => {
		expect(getLoops(el({ loops: "4.7" }))).toBe(4.7);
		expect(getLoops(el({ loops: "1.999" }))).toBe(1.999);
	});

	it("rejects Infinity and NaN, defaulting to 1", () => {
		expect(getLoops(el({ loops: "Infinity" }))).toBe(1);
		expect(getLoops(el({ loops: "-Infinity" }))).toBe(1);
		expect(getLoops(el({ loops: "NaN" }))).toBe(1);
	});

	it("has no ceiling", () => {
		expect(getLoops(el({ loops: "9" }))).toBe(9);
		expect(getLoops(el({ loops: "999999999" }))).toBe(999999999);
	});

	it("clamps negative loop counts to 1", () => {
		expect(getLoops(el({ loops: "-5" }))).toBe(1);
	});
});

describe("what the pickers offer", () => {
	it.each([
		["volume", VOLUME_OPTIONS, getVolume],
		["duration", durationOptions(STANDARD_MAX_DURATION_SEC), getDuration],
	] as const)("reads every %s option as itself", (key, options, read) => {
		for (const option of options) {
			expect(read(el({ [key]: option }))).toBe(Number(option));
		}
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
});

describe("layoutAttributeSignature", () => {
	it("joins raw layout attribute values in LAYOUT_ATTRIBUTE_KEYS order", () => {
		expect(
			layoutAttributeSignature(
				el({
					loops: "2",
					volume: "5",
					motion: "kenBurnsIn",
				}),
			),
		).toBe("2::5:kenBurnsIn:::");
	});

	it("uses empty segments for absent attributes (raw, uncoerced)", () => {
		expect(layoutAttributeSignature(el())).toBe("::::::");
		expect(layoutAttributeSignature(el({ loops: "0" }))).toBe("0::::::");
		expect(layoutAttributeSignature(el({ volume: "10" }))).toBe("::10::::");
		expect(layoutAttributeSignature(el({ motion: "shake" }))).toBe(
			":::shake:::",
		);
	});
});

describe("trim attributes", () => {
	it("reads an unset or invalid trim as none", () => {
		expect(getTrimStart(el())).toBe(0);
		expect(getTrimStart(el({ trimStart: "-1" }))).toBe(0);
		expect(getTrimEnd(el())).toBeUndefined();
		expect(getTrimEnd(el({ trimEnd: "nope" }))).toBeUndefined();
	});

	it("reads valid seconds", () => {
		expect(getTrimStart(el({ trimStart: "1.25" }))).toBe(1.25);
		expect(getTrimEnd(el({ trimEnd: " 4 " }))).toBe(4);
	});
});
