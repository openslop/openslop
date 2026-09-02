import { describe, expect, it } from "vitest";
import type { ModelRef } from "@/lib/connectors/types";
import { vendorParams } from "../job-handlers";

const job = (model: ModelRef) => ({
	connector_type: "image" as const,
	request: { prompt: "a cat", ...model },
});

describe("vendorParams", () => {
	it("hands the provider the id its own API takes, with the routing stripped", () => {
		expect(
			vendorParams(job({ provider: "runware", model: "Seedream 5 Lite" })),
		).toEqual({
			prompt: "a cat",
			model: "bytedance:seedream@5.0-lite",
		});
	});

	// The two share a vendor id, which is why the id alone could never say whose key to read.
	it("maps a hosted model and its BYOK twin to the same vendor id", () => {
		expect(
			vendorParams(job({ provider: "openslop", model: "Slop Image v1" })).model,
		).toBe(
			vendorParams(job({ provider: "runware", model: "Seedream 5 Lite" }))
				.model,
		);
	});

	it("throws for a model the provider does not serve", () => {
		expect(() =>
			vendorParams(job({ provider: "runware", model: "Slop Image v1" })),
		).toThrow();
	});
});
