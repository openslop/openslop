import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	optionalDurationSeconds,
	optionalImageDimensions,
	optionalVideoDuration,
} from "@/lib/api/request-schema-fields";

const dimensions = z.object(optionalImageDimensions);
const videoDuration = z.object(optionalVideoDuration);
const durationSeconds = z.object(optionalDurationSeconds);

describe("optionalCoercedNumber (image dimensions / video duration)", () => {
	it("accepts positive numbers and coerces numeric strings", () => {
		expect(dimensions.parse({ width: 1280, height: "720" })).toEqual({
			width: 1280,
			height: 720,
		});
		expect(videoDuration.parse({ duration: "5" })).toEqual({ duration: 5 });
	});

	it("treats missing fields as undefined", () => {
		expect(dimensions.parse({})).toEqual({});
		expect(videoDuration.parse({})).toEqual({});
	});

	it("rejects blank and whitespace-only strings instead of coercing to 0", () => {
		expect(dimensions.safeParse({ width: "" }).success).toBe(false);
		expect(dimensions.safeParse({ width: "   " }).success).toBe(false);
	});

	it("rejects zero and negative values", () => {
		expect(dimensions.safeParse({ width: 0 }).success).toBe(false);
		expect(dimensions.safeParse({ height: -720 }).success).toBe(false);
		expect(videoDuration.safeParse({ duration: -5 }).success).toBe(false);
		expect(videoDuration.safeParse({ duration: "-5" }).success).toBe(false);
	});

	it("rejects non-finite values", () => {
		expect(videoDuration.safeParse({ duration: "abc" }).success).toBe(false);
		expect(videoDuration.safeParse({ duration: Number.NaN }).success).toBe(
			false,
		);
	});
});

describe("optionalDurationSeconds (sfx / music)", () => {
	it("accepts positive durations and missing values", () => {
		expect(durationSeconds.parse({ durationSeconds: 3 })).toEqual({
			durationSeconds: 3,
		});
		expect(durationSeconds.parse({})).toEqual({});
	});

	it("rejects zero and negative durations", () => {
		expect(durationSeconds.safeParse({ durationSeconds: 0 }).success).toBe(
			false,
		);
		expect(durationSeconds.safeParse({ durationSeconds: -2 }).success).toBe(
			false,
		);
	});
});
