import { describe, expect, it, vi } from "vitest";
import { uploadedResult } from "../uploaded-result";

vi.mock("mediabunny", () => ({
	ALL_FORMATS: [],
	UrlSource: class {},
	Input: class {
		getDurationFromMetadata = async () => 7.5;
		computeDuration = async () => 0;
		dispose() {}
	},
}));

describe("uploadedResult", () => {
	it("shows an image for no time of its own", async () => {
		await expect(
			uploadedResult("image", "https://blob/a.png"),
		).resolves.toEqual({ imageUrl: "https://blob/a.png", durationSec: 0 });
	});

	it("plays a video for its own length", async () => {
		await expect(
			uploadedResult("video", "https://blob/a.mp4"),
		).resolves.toEqual({ videoUrl: "https://blob/a.mp4", durationSec: 7.5 });
	});

	it("plays audio for its own length", async () => {
		await expect(
			uploadedResult("audio", "https://blob/a.mp3"),
		).resolves.toEqual({ audioUrl: "https://blob/a.mp3", durationSec: 7.5 });
	});
});
