import { describe, expect, it } from "vitest";
import { z } from "zod";
import { optionalLlmSampling } from "../request-schema-fields";

const schema = z.object(optionalLlmSampling);

describe("optionalLlmSampling", () => {
	it("accepts in-range temperature and maxTokens", () => {
		expect(schema.safeParse({ temperature: 0, maxTokens: 1 }).success).toBe(
			true,
		);
		expect(schema.safeParse({ temperature: 1, maxTokens: 4096 }).success).toBe(
			true,
		);
		expect(schema.safeParse({}).success).toBe(true);
	});

	it("rejects temperature outside [0, 1] at the boundary", () => {
		expect(schema.safeParse({ temperature: -0.1 }).success).toBe(false);
		expect(schema.safeParse({ temperature: 1.5 }).success).toBe(false);
		expect(schema.safeParse({ temperature: 3 }).success).toBe(false);
	});

	it("rejects non-positive or fractional maxTokens", () => {
		expect(schema.safeParse({ maxTokens: 0 }).success).toBe(false);
		expect(schema.safeParse({ maxTokens: -100 }).success).toBe(false);
		expect(schema.safeParse({ maxTokens: 10.5 }).success).toBe(false);
	});
});
