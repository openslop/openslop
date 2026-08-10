import { describe, expect, it } from "vitest";
import { resolveCaptionsEnabled } from "../captions";

describe("resolveCaptionsEnabled", () => {
	it("defaults to enabled when unset", () => {
		expect(resolveCaptionsEnabled({})).toBe(true);
		expect(resolveCaptionsEnabled({ videoSettings: {} })).toBe(true);
	});

	it("reads the project setting", () => {
		expect(resolveCaptionsEnabled({ videoSettings: { captions: false } })).toBe(
			false,
		);
		expect(resolveCaptionsEnabled({ videoSettings: { captions: true } })).toBe(
			true,
		);
	});
});
