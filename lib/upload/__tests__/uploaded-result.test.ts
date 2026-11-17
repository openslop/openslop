import { describe, expect, it, vi } from "vitest";
import { toCaption } from "@/lib/captions/word-captions";
import type { GenerationNode } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import { commitUploaded, uploadedResult } from "../uploaded-result";

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
		).resolves.toEqual({
			imageUrl: "https://blob/a.png",
			durationSec: 0,
			uploaded: true,
		});
	});

	it("plays a video for its own length", async () => {
		await expect(
			uploadedResult("video", "https://blob/a.mp4"),
		).resolves.toEqual({
			videoUrl: "https://blob/a.mp4",
			durationSec: 7.5,
			uploaded: true,
		});
	});

	it("plays audio for its own length", async () => {
		await expect(
			uploadedResult("audio", "https://blob/a.mp3"),
		).resolves.toEqual({
			audioUrl: "https://blob/a.mp3",
			durationSec: 7.5,
			uploaded: true,
		});
	});

	it("hands stored media captions to an element result", async () => {
		const captions = [toCaption("hello", 0, 0.4)];
		const node = {} as GenerationNode;
		const commitResult = vi.fn();
		const queue = { commitResult } as unknown as GenerationQueue;

		await commitUploaded(queue, node, "video", "https://blob/a.mp4", captions);

		expect(commitResult).toHaveBeenCalledWith(
			node,
			{
				videoUrl: "https://blob/a.mp4",
				durationSec: 7.5,
				uploaded: true,
				textTimestamps: captions,
				originalTextTimestamps: captions,
			},
			{ pinned: true },
		);
	});
});
