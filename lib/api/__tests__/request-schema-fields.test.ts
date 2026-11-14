import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	optionalDurationSeconds,
	optionalImageDimensions,
	optionalVideoDuration,
	rowId,
} from "../request-schema-fields";

const schema = z.object({
	...optionalImageDimensions,
	...optionalVideoDuration,
	...optionalDurationSeconds,
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

describe("durationSeconds", () => {
	it("takes a positive number", () => {
		expect(schema.parse({ durationSeconds: 30 })).toEqual({
			durationSeconds: 30,
		});
	});

	it.each([
		["zero", 0],
		["negative", -1],
		["string", "30"],
	])("refuses a %s", (_label, value) => {
		expect(schema.safeParse({ durationSeconds: value }).success).toBe(false);
	});
});

describe("rowId", () => {
	it("takes any id Postgres stores, not only RFC uuids", () => {
		expect(rowId.parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")).toBe(
			"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		);
	});

	it.each(["", "not-a-uuid", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa"])(
		"rejects %o",
		(id) => {
			expect(rowId.safeParse(id).success).toBe(false);
		},
	);
});
