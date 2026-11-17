import { describe, expect, it, vi } from "vitest";
import { toCaption } from "../word-captions";
import { getMediaCaptions } from "../media-captions";

const item = {
	name: "interview",
	kind: "video",
	url: "https://blob/interview.mp4",
} as const;
const words = [toCaption("hello", 0, 0.4)];

describe("getMediaCaptions", () => {
	it("returns a saved transcript without transcribing again", async () => {
		const transcribe = vi.fn(async () => words);

		await expect(
			getMediaCaptions({ ...item, captions: words }, transcribe),
		).resolves.toEqual(words);
		expect(transcribe).not.toHaveBeenCalled();
	});

	it("shares an in-flight transcription for the same file", async () => {
		let finish: ((captions: typeof words) => void) | undefined;
		const request = new Promise<typeof words>((resolve) => {
			finish = resolve;
		});
		const transcribe = vi.fn(() => request);
		const first = getMediaCaptions(item, transcribe);
		const second = getMediaCaptions(item, transcribe);
		await Promise.resolve();

		expect(transcribe).toHaveBeenCalledOnce();
		if (!finish) throw new Error("Transcription did not start");
		finish(words);
		await expect(Promise.all([first, second])).resolves.toEqual([words, words]);
	});

	it("rejects images because they have no audio", async () => {
		await expect(
			getMediaCaptions({ ...item, kind: "image" }, vi.fn()),
		).rejects.toThrow("interview has no audio to caption.");
	});
});
