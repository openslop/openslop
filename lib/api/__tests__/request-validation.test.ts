import { describe, expect, it } from "vitest";
import {
	validateReferenceImages,
	validateRequiredString,
} from "../request-validation";

describe("validateRequiredString", () => {
	it("accepts present non-empty strings", () => {
		expect(validateRequiredString({ voiceId: "abc" }, "voiceId")).toBeNull();
	});

	it("rejects missing, non-string, and empty values", async () => {
		const missing = validateRequiredString({}, "voiceId");
		const nonString = validateRequiredString({ voiceId: 42 }, "voiceId");
		const empty = validateRequiredString({ voiceId: "" }, "voiceId");

		expect(missing?.status).toBe(400);
		expect(nonString?.status).toBe(400);
		expect(empty?.status).toBe(400);
		expect((await missing?.json())?.error).toBe("voiceId is required");
	});
});

describe("validateReferenceImages", () => {
	it("accepts missing referenceImages", () => {
		expect(validateReferenceImages({})).toBeNull();
	});

	it("rejects invalid container and entry values", async () => {
		const notArray = validateReferenceImages({ referenceImages: "nope" });
		const nonString = validateReferenceImages({ referenceImages: [42] });
		const invalidFormat = validateReferenceImages({
			referenceImages: ["ftp://example.com/a.png"],
		});

		expect(notArray?.status).toBe(400);
		expect(nonString?.status).toBe(400);
		expect(invalidFormat?.status).toBe(400);
		expect((await notArray?.json())?.error).toBe(
			"referenceImages must be an array",
		);
	});

	it("accepts data URIs and HTTPS URLs", () => {
		expect(
			validateReferenceImages({
				referenceImages: [
					"data:image/png;base64,abc123",
					"https://example.com/image.png",
				],
			}),
		).toBeNull();
	});
});
