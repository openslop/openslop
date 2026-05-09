import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/asset-bundle");

const mockConvert = vi.fn();

vi.mock("@elevenlabs/elevenlabs-js", () => ({
	ElevenLabsClient: class {
		textToSoundEffects = { convert: mockConvert };
	},
}));

import { ElevenLabsSFX } from "../sfx/elevenlabs";

function mockReadableStream(data: Uint8Array) {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(data);
			controller.close();
		},
	});
}

describe("ElevenLabsSFX", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("omits durationSeconds and computes duration from buffer when no duration provided", async () => {
		// 32000 bytes at 128 kbps CBR mp3 = 2 seconds
		const audio = new Uint8Array(32000);
		mockConvert.mockResolvedValue(mockReadableStream(audio));

		const provider = new ElevenLabsSFX("test-key");
		const result = await provider.generate({ prompt: "boom" });

		expect(result.result.audio).toBe("url");
		expect(result.metadata?.durationSec).toBe(2);
		expect(mockConvert).toHaveBeenCalledWith({
			text: "boom",
			durationSeconds: undefined,
			outputFormat: "mp3_44100_128",
		});
	});

	it("passes custom duration", async () => {
		mockConvert.mockResolvedValue(mockReadableStream(new Uint8Array([0])));

		const provider = new ElevenLabsSFX("test-key");
		await provider.generate({ prompt: "crash", durationSeconds: 10 });

		expect(mockConvert).toHaveBeenCalledWith(
			expect.objectContaining({ durationSeconds: 10 }),
		);
	});
});
