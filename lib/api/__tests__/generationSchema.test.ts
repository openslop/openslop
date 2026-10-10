import { describe, expect, it } from "vitest";
import {
	bodySchema,
	byokModel,
	hostedModel,
	LLM_FIELDS,
} from "../generationSchema";

describe("bodySchema with a hosted model", () => {
	const schema = bodySchema(hostedModel("image"), {});

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
	const schema = bodySchema(byokModel("image"), {});

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

describe("LLM fields", () => {
	const schema = bodySchema(hostedModel("llm"), LLM_FIELDS);
	const withMaxTokens = (maxTokens: unknown) =>
		schema.safeParse({ prompt: "hi", model: "Slop LLM v1", maxTokens });

	it("takes a positive whole maxTokens", () => {
		expect(withMaxTokens(4096).data?.maxTokens).toBe(4096);
	});

	it.each([0, 1.5, "4096"])("refuses maxTokens %j", (maxTokens) => {
		expect(withMaxTokens(maxTokens).error?.issues[0]?.message).toBe(
			"maxTokens must be a positive integer",
		);
	});
});
