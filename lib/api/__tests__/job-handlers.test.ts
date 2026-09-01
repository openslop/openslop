import { describe, expect, it } from "vitest";
import { providerRequest, vendorParams } from "../job-handlers";

const job = (model?: string) => ({
	user_id: "user-1",
	connector_type: "image" as const,
	request: { prompt: "a cat", ...(model && { model }) },
});

// The queue worker runs later, in another process, with only the row. What it
// needs comes out of the model the job named, so the row records nothing else.
describe("providerRequest", () => {
	it("runs a hosted model on OpenSlop's own keys", () => {
		expect(providerRequest(job("Slop Image v1"))).toEqual({
			userId: "user-1",
			provider: "openslop",
		});
	});

	it("runs a BYOK model on the account that asked for it", () => {
		expect(providerRequest(job("Seedream 5 Lite"))).toEqual({
			userId: "user-1",
			provider: "runware",
		});
	});

	// The two share a vendor id, which is why the id alone could never say this.
	it("tells apart two models the vendor calls the same thing", () => {
		expect(vendorParams(job("Slop Image v1")).model).toBe(
			vendorParams(job("Seedream 5 Lite")).model,
		);
		expect(providerRequest(job("Slop Image v1")).provider).not.toBe(
			providerRequest(job("Seedream 5 Lite")).provider,
		);
	});

	it("falls back to the catalog default when the job named no model", () => {
		expect(providerRequest(job()).provider).toBe("openslop");
	});
});

describe("vendorParams", () => {
	it("hands the provider the id its own API takes", () => {
		expect(vendorParams(job("Seedream 5 Lite"))).toEqual({
			prompt: "a cat",
			model: "bytedance:seedream@5.0-lite",
		});
	});
});
