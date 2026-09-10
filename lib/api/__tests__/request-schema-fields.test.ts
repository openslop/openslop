import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	optionalImageDimensions,
	optionalVideoDuration,
} from "../request-schema-fields";

const schema = z.object({
	...optionalImageDimensions,
	...optionalVideoDuration,
});

describe("sized request fields", () => {
	it("takes numbers and numeric strings", () => {
		expect(schema.parse({ width: 1280, height: "720", duration: "8" })).toEqual(
			{ width: 1280, height: 720, duration: 8 },
		);
	});

	it("leaves an unnamed field unset", () => {
		expect(schema.parse({})).toEqual({});
	});

	it.each([
		["zero", 0],
		["negative", -1],
		["empty string", ""],
		["non-numeric", "abc"],
	])("refuses a %s size", (_label, value) => {
		expect(schema.safeParse({ width: value }).success).toBe(false);
		expect(schema.safeParse({ duration: value }).success).toBe(false);
	});
});
