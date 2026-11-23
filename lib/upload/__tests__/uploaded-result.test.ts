import { describe, expect, it, vi } from "vitest";
import { toCaption } from "@/lib/captions/word-captions";
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
			uploadedResult({ kind: "image", url: "https://blob/a.png" }),
		).resolves.toEqual({
			imageUrl: "https://blob/a.png",
			durationSec: 0,
			uploaded: true,
		});
	});

	it("plays a video for its own length", async () => {
		await expect(
			uploadedResult({ kind: "video", url: "https://blob/a.mp4" }),
		).resolves.toEqual({
			videoUrl: "https://blob/a.mp4",
			durationSec: 7.5,
			uploaded: true,
		});
	});

	it("plays audio for its own length", async () => {
		await expect(
			uploadedResult({ kind: "audio", url: "https://blob/a.mp3" }),
		).resolves.toEqual({
			audioUrl: "https://blob/a.mp3",
			durationSec: 7.5,
			uploaded: true,
		});
	});

	it("shows a file's saved captions as its words", async () => {
		const captions = [toCaption("hello", 0, 0.4)];

		await expect(
			uploadedResult({ kind: "video", url: "https://blob/a.mp4", captions }),
		).resolves.toEqual({
			videoUrl: "https://blob/a.mp4",
			durationSec: 7.5,
			uploaded: true,
			textTimestamps: captions,
			originalTextTimestamps: captions,
		});
	});
});
