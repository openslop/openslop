import { describe, expect, it } from "vitest";
import { bodySchema } from "../generation-schema";

const schema = bodySchema("image", "byok", {});

describe("bodySchema, byok scope", () => {
	// The hosted models have their own routes, with their own auth and keys.
	it("offers only the models a user's own key serves", () => {
		const parsed = schema.safeParse({
			prompt: "a cat",
			model: "Slop Image v1",
		});
		expect(parsed.success).toBe(false);
	});

	// The name is what says whose key to read, so it is kept rather than
	// transformed into the provider's id at the boundary.
	it("keeps the model's name", () => {
		const parsed = schema.parse({ prompt: "a cat", model: "Seedream 5 Lite" });
		expect(parsed.model).toBe("Seedream 5 Lite");
	});

	it("requires a model, unlike the hosted routes", () => {
		expect(schema.safeParse({ prompt: "a cat" }).success).toBe(false);
	});
});
