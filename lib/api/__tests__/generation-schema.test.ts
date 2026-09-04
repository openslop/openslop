import { describe, expect, it } from "vitest";
import { BYOK_IMAGE_MODELS } from "@/lib/connectors/image/models";
import { OPENSLOP_IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";
import { bodySchema, byokModel, hostedModel } from "../generation-schema";

describe("bodySchema with a hosted model", () => {
	const schema = bodySchema(hostedModel(OPENSLOP_IMAGE_MODELS), {});

	it("takes the model alone and records the provider as ours", () => {
		expect(schema.parse({ prompt: "a cat", model: "Slop Image v1" })).toEqual({
			prompt: "a cat",
			provider: "openslop",
			model: "Slop Image v1",
		});
	});

	it("requires a model", () => {
		expect(schema.safeParse({ prompt: "a cat" }).success).toBe(false);
	});

	it("refuses a model another provider serves", () => {
		expect(
			schema.safeParse({ prompt: "a cat", model: "Seedream 5 Lite" }).success,
		).toBe(false);
	});

	it("refuses a caller claiming another provider", () => {
		expect(
			schema.safeParse({
				prompt: "a cat",
				provider: "runware",
				model: "Slop Image v1",
			}).success,
		).toBe(false);
	});
});

describe("bodySchema with BYOK models", () => {
	const schema = bodySchema(byokModel(BYOK_IMAGE_MODELS), {});

	it("takes the provider and model pair as named", () => {
		expect(
			schema.parse({
				prompt: "a cat",
				provider: "runware",
				model: "Seedream 5 Lite",
			}),
		).toEqual({
			prompt: "a cat",
			provider: "runware",
			model: "Seedream 5 Lite",
		});
	});

	it("requires the provider", () => {
		expect(
			schema.safeParse({ prompt: "a cat", model: "Seedream 5 Lite" }).success,
		).toBe(false);
	});

	it("refuses a model the named provider does not serve", () => {
		expect(
			schema.safeParse({
				prompt: "a cat",
				provider: "runware",
				model: "Slop Image v1",
			}).success,
		).toBe(false);
	});

	it("refuses a provider the route does not serve", () => {
		expect(
			schema.safeParse({
				prompt: "a cat",
				provider: "openslop",
				model: "Slop Image v1",
			}).success,
		).toBe(false);
	});
});
