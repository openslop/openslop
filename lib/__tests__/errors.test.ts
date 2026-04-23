import { describe, expect, it } from "vitest";
import { toError } from "../errors";

describe("toError", () => {
	it("returns the same instance for an Error", () => {
		const err = new Error("original");
		expect(toError(err)).toBe(err);
	});

	it("returns the same instance for an Error subclass", () => {
		const err = new TypeError("bad type");
		expect(toError(err)).toBe(err);
	});

	it("wraps a string in an Error", () => {
		const err = toError("something broke");
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe("something broke");
	});

	it("wraps a number in an Error", () => {
		const err = toError(404);
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe("404");
	});

	it("wraps null in an Error", () => {
		const err = toError(null);
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe("null");
	});

	it("wraps undefined in an Error", () => {
		const err = toError(undefined);
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe("undefined");
	});

	it("wraps an object in an Error using its string representation", () => {
		const err = toError({ code: 500 });
		expect(err).toBeInstanceOf(Error);
		expect(err.message).toBe("[object Object]");
	});
});
