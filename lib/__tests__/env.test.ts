import { describe, expect, it } from "vitest";
import { requiredEnv } from "../env";

describe("requiredEnv", () => {
	it("returns the value when it is set", () => {
		expect(requiredEnv("SOME_VAR", "value")).toBe("value");
	});

	it.each([undefined, ""])("names the variable when it is %j", (value) => {
		expect(() => requiredEnv("SOME_VAR", value)).toThrow(
			"SOME_VAR is required",
		);
	});
});
