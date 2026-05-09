import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockCompose = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		music = { compose: mockCompose };
	},
}));

import { ElevenLabsMusic } from "../music/elevenlabs";

function mockReadableStream(data: Uint8Array) {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(data);
			controller.close();
		},
	});
}

describe("ElevenLabsMusic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("omits musicLengthMs and computes duration from buffer when no duration provided", async () => {
		// 16000 bytes at 128 kbps CBR mp3 = 1 second
		const audio = new Uint8Array(16000);
		mockCompose.mockResolvedValue(mockReadableStream(audio));

		const provider = new ElevenLabsMusic("test-key");
		const result = await provider.generate({ prompt: "jazz" });

		expect(result.result.audio).toBe("url");
		expect(result.metadata?.durationSec).toBe(1);
		expect(mockCompose).toHaveBeenCalledWith({
			prompt: "jazz",
			musicLengthMs: undefined,
			modelId: "music_v1",
			outputFormat: "mp3_44100_128",
		});
	});

	it("passes custom duration", async () => {
		mockCompose.mockResolvedValue(mockReadableStream(new Uint8Array([0])));

		const provider = new ElevenLabsMusic("test-key");
		await provider.generate({ prompt: "rock", durationSeconds: 60 });

		expect(mockCompose).toHaveBeenCalledWith(
			expect.objectContaining({ musicLengthMs: 60000 }),
		);
	});
});
