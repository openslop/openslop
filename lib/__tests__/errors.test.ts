import { describe, expect, it } from "vitest";
import { humanErrorMessage } from "../errors";

describe("humanErrorMessage", () => {
	it("returns a string error as-is", () => {
		expect(humanErrorMessage("boom", "fallback")).toBe("boom");
	});

	it("returns the message of an Error instance (no stack, no JSON)", () => {
		expect(humanErrorMessage(new Error("boom"), "fallback")).toBe("boom");
	});

	it("reads a flat {message} payload", () => {
		expect(humanErrorMessage({ message: "flat" }, "fallback")).toBe("flat");
	});

	it("reads a wrapped {error: {message}} payload", () => {
		expect(
			humanErrorMessage({ error: { message: "wrapped" } }, "fallback"),
		).toBe("wrapped");
	});

	it("reads the first entry of an {errors: [...]} batch payload", () => {
		expect(
			humanErrorMessage(
				{ errors: [{ message: "first" }, { message: "second" }] },
				"fallback",
			),
		).toBe("first");
	});

	it.each([
		["null", null],
		["undefined", undefined],
		["a number", 42],
		["an object with no message", { code: "weird" }],
		["a non-string message", { message: 42 }],
		["an empty errors array", { errors: [] }],
	])("falls back for %s", (_label, value) => {
		expect(humanErrorMessage(value, "fallback")).toBe("fallback");
	});
});
