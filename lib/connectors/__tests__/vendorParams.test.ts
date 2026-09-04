import { describe, expect, it } from "vitest";
import { vendorParams } from "../models";
import type { ModelRef } from "../types";

const request = (model: ModelRef) =>
	vendorParams("image", { prompt: "a cat", ...model });

describe("vendorParams", () => {
	it("hands the provider the id its own API takes, with the routing stripped", () => {
		expect(request({ provider: "runware", model: "Seedream 5 Lite" })).toEqual({
			prompt: "a cat",
			model: "bytedance:seedream@5.0-lite",
		});
	});

	// The two share a vendor id, which is why the id alone could never say whose key to read.
	it("maps a hosted model and its BYOK twin to the same vendor id", () => {
		expect(
			request({ provider: "openslop", model: "Slop Image v1" }).model,
		).toBe(request({ provider: "runware", model: "Seedream 5 Lite" }).model);
	});

	it("throws for a model the provider does not serve", () => {
		expect(() =>
			request({ provider: "runware", model: "Slop Image v1" }),
		).toThrow();
	});
});
