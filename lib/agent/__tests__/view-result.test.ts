import { describe, expect, it } from "vitest";
import { toCaption } from "@/lib/captions/word-captions";
import { describeResult } from "../tools/view-result";

describe("describeResult", () => {
	it("names an image by its URL", () => {
		expect(
			describeResult({
				durationSec: 0,
				images: [{ url: "https://example.com/wolf.jpg" }],
				words: [],
			}),
		).toBe("image: https://example.com/wolf.jpg");
	});

	it("gives a video its length and each frame its time", () => {
		expect(
			describeResult({
				durationSec: 6,
				images: [
					{ url: "https://example.com/first.jpg", at: 0 },
					{ url: "https://example.com/last.jpg", at: 6 },
				],
				words: [],
			}),
		).toBe(
			[
				"6.0s long",
				"frame at 0.0s: https://example.com/first.jpg",
				"frame at 6.0s: https://example.com/last.jpg",
			].join("\n"),
		);
	});

	it("lists every word with when it is said", () => {
		expect(
			describeResult({
				durationSec: 1.2,
				images: [],
				words: [toCaption("hello", 0, 0.4), toCaption("there", 0.5, 1.1)],
			}),
		).toBe(["1.2s long", "[0.0s-0.4s] hello", "[0.5s-1.1s] there"].join("\n"));
	});
});
