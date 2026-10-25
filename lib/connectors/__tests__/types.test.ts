import { describe, expect, it } from "vitest";
import { CaptionSchema } from "../types";

const timed = { startMs: 0, endMs: 1, timestampMs: null, confidence: null };

describe("CaptionSchema", () => {
	it("holds a word as spelled", () => {
		expect(CaptionSchema.parse({ ...timed, text: "猫は" }).text).toBe("猫は");
	});

	it("rejects a word padded with spaces, or none", () => {
		expect(CaptionSchema.safeParse({ ...timed, text: " hello" }).success).toBe(
			false,
		);
		expect(CaptionSchema.safeParse({ ...timed, text: "" }).success).toBe(false);
	});
});
